#!/usr/bin/env python3
"""
Script to fetch songs from YouTube Music playlist and add to Supabase database
"""
import os
import re
from dotenv import load_dotenv
from googleapiclient.discovery import build
from supabase import create_client, Client

# Load environment variables from .env.local
load_dotenv('.env.local')

# Configuration
PLAYLIST_ID = "PLeIBg3zIku5cPNLtN0dAhme8B0lXarZUm"
YOUTUBE_API_KEY = os.getenv('YOUTUBE_API_KEY')
SUPABASE_URL = os.getenv('NEXT_PUBLIC_SUPABASE_URL')
SUPABASE_KEY = os.getenv('SUPABASE_SERVICE_ROLE_KEY') or os.getenv('NEXT_PUBLIC_SUPABASE_ANON_KEY')

if not YOUTUBE_API_KEY:
    raise ValueError("YOUTUBE_API_KEY not found in .env.local")
if not SUPABASE_URL or not SUPABASE_KEY:
    raise ValueError("Supabase credentials not found in .env.local")

# Initialize Supabase client
supabase: Client = create_client(SUPABASE_URL, SUPABASE_KEY)

def get_playlist_items(youtube, playlist_id):
    """Fetch all items from a YouTube playlist"""
    items = []
    next_page_token = None
    
    while True:
        request = youtube.playlistItems().list(
            part='snippet,contentDetails',
            playlistId=playlist_id,
            maxResults=50,
            pageToken=next_page_token
        )
        response = request.execute()
        
        items.extend(response.get('items', []))
        next_page_token = response.get('nextPageToken')
        
        if not next_page_token:
            break
    
    return items

def get_video_details(youtube, video_ids):
    """Fetch video details to get actual uploader channel information"""
    video_details = {}
    
    # YouTube API allows up to 50 video IDs per request
    for i in range(0, len(video_ids), 50):
        batch = video_ids[i:i+50]
        request = youtube.videos().list(
            part='snippet',
            id=','.join(batch)
        )
        response = request.execute()
        
        for video in response.get('items', []):
            video_id = video['id']
            snippet = video['snippet']
            video_details[video_id] = {
                'channelTitle': snippet.get('channelTitle', 'unknown'),
                'title': snippet.get('title', '')
            }
    
    return video_details

def get_existing_songs():
    """Get existing songs from Supabase"""
    response = supabase.table('musix_songs').select('youtube_id, week, song_name, artist').execute()
    
    songs_by_id = {}
    songs_by_name_artist = {}
    max_week = 0
    
    for song in response.data:
        youtube_id = song['youtube_id']
        week = song['week']
        song_name = song['song_name']
        artist = song['artist']
        
        songs_by_id[youtube_id] = {
            'week': week,
            'songName': song_name,
            'artist': artist,
            'youtubeId': youtube_id
        }
        
        # Track by normalized song name + artist (case-insensitive)
        normalized_key = f"{song_name.lower().strip()}|{artist.lower().strip()}"
        songs_by_name_artist[normalized_key] = {
            'week': week,
            'songName': song_name,
            'artist': artist,
            'youtubeId': youtube_id
        }
        
        # Extract week number
        week_num = int(re.search(r'\d+', week).group()) if re.search(r'\d+', week) else 0
        max_week = max(max_week, week_num)
    
    return songs_by_id, songs_by_name_artist, max_week

def add_song_to_db(week, song_name, artist, youtube_id):
    """Add a song to Supabase database"""
    try:
        response = supabase.table('musix_songs').insert({
            'week': week,
            'song_name': song_name,
            'artist': artist,
            'youtube_id': youtube_id
        }).execute()
        return True
    except Exception as e:
        print(f"  Error adding song to database: {e}")
        return False

def main():
    # Initialize YouTube API client
    youtube = build('youtube', 'v3', developerKey=YOUTUBE_API_KEY)
    
    print(f"Fetching playlist items from playlist: {PLAYLIST_ID}")
    playlist_items = get_playlist_items(youtube, PLAYLIST_ID)
    print(f"Found {len(playlist_items)} items in playlist")
    
    # Get existing songs from database
    existing_songs_by_id, existing_songs_by_name_artist, max_week = get_existing_songs()
    print(f"Found {len(existing_songs_by_id)} existing songs in database (max week: {max_week})")
    
    # Get video IDs to fetch actual channel information
    video_ids = [item['contentDetails']['videoId'] for item in playlist_items]
    print(f"Fetching video details to get actual channel information...")
    video_details = get_video_details(youtube, video_ids)
    
    # Process playlist items in order they appear in playlist
    new_songs_count = 0
    new_week = max_week + 1
    
    for item in playlist_items:
        video_id = item['contentDetails']['videoId']
        snippet = item['snippet']
        title = snippet['title']
        
        # Skip if already in database by video ID
        if video_id in existing_songs_by_id:
            print(f"  Skipping (duplicate video ID): {title} ({video_id})")
            continue
        
        # Get actual video channel/uploader information
        video_info = video_details.get(video_id, {})
        actual_channel = video_info.get('channelTitle', 'unknown')
        # Remove YouTube Music topic channel suffix immediately
        actual_channel = re.sub(r'\s*-\s*[Tt]opic\s*$', '', actual_channel).strip()
        
        # Extract song name and artist from title
        # Common formats: "Song Name - Artist" or "Artist - Song Name"
        # Try to parse, but use actual uploader channel as fallback if parsing fails
        song_name = title
        artist = actual_channel  # Use actual video uploader channel as default artist
        
        # Try common separators
        separators = [' - ', ' – ', ' — ', ' | ']
        for sep in separators:
            if sep in title:
                parts = title.split(sep, 1)
                # Usually format is "Song - Artist" or "Artist - Song"
                # We'll assume first part is song, second is artist
                song_name = parts[0].strip()
                artist = parts[1].strip()
                break
        
        # Clean up song name (remove common prefixes and suffixes)
        song_name = re.sub(r'^\[.*?\]\s*', '', song_name)  # Remove [Official Video] etc
        song_name = re.sub(r'\s*\(.*?\)\s*$', '', song_name)  # Remove (Official Video) etc
        song_name = song_name.strip()
        
        # Clean up artist (remove common suffixes like "(Official Music Video)")
        artist = re.sub(r'\s*\(.*?\)\s*$', '', artist)  # Remove (Official Music Video) etc
        artist = re.sub(r'\s*\[.*?\]\s*$', '', artist)  # Remove [Official Video] etc
        # Remove YouTube Music topic channel suffix (e.g., "Artist - Topic" or "Artist - topic")
        artist = re.sub(r'\s*-\s*[Tt]opic\s*$', '', artist)
        artist = artist.strip()
        
        # If artist is still empty or just whitespace, use actual video channel
        if not artist or artist.lower() == 'unknown':
            artist = actual_channel
            # Also clean up the actual_channel if we're using it
            artist = re.sub(r'\s*-\s*[Tt]opic\s*$', '', artist).strip()
        
        # Check for duplicate by normalized song name + artist (case-insensitive)
        normalized_key = f"{song_name.lower().strip()}|{artist.lower().strip()}"
        if normalized_key in existing_songs_by_name_artist:
            existing = existing_songs_by_name_artist[normalized_key]
            print(f"  Skipping (duplicate song): {song_name} by {artist} (already exists as {existing['songName']} by {existing['artist']} in {existing['week']})")
            continue
        
        # Format week string
        week_str = f"week {new_week:02d}"
        
        # Add to database
        if add_song_to_db(week_str, song_name, artist, video_id):
            print(f"  Added: week {new_week:02d} - {song_name} by {artist} ({video_id})")
            new_songs_count += 1
            new_week += 1
        else:
            print(f"  Failed to add: {song_name} by {artist} ({video_id})")
    
    if new_songs_count == 0:
        print("No new songs to add!")
    else:
        print(f"\nSuccessfully added {new_songs_count} new song(s) to database!")

if __name__ == '__main__':
    main()
