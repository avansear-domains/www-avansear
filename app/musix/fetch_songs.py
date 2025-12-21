#!/usr/bin/env python3
"""
Script to fetch songs from YouTube Music playlist and update archive.ts
"""
import os
import re
from pathlib import Path
from dotenv import load_dotenv
from googleapiclient.discovery import build

# Load environment variables from .env.local
load_dotenv('.env.local')

# Configuration
PLAYLIST_ID = "PLeIBg3zIku5cPNLtN0dAhme8B0lXarZUm"
YOUTUBE_API_KEY = os.getenv('YOUTUBE_API_KEY')
# Archive file is in the same directory as this script
ARCHIVE_FILE = Path(__file__).parent / 'archive.ts'

if not YOUTUBE_API_KEY:
    raise ValueError("YOUTUBE_API_KEY not found in .env.local")

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

def parse_archive_file():
    """Parse existing archive.ts to extract current songs"""
    with open(ARCHIVE_FILE, 'r', encoding='utf-8') as f:
        content = f.read()
    
    # Extract all song entries using regex
    pattern = r'\{\s*week:\s*"([^"]+)",\s*songName:\s*"([^"]+)",\s*artist:\s*"([^"]+)",\s*youtubeId:\s*"([^"]+)"\s*\}'
    matches = re.findall(pattern, content)
    
    songs_by_id = {}
    songs_by_name_artist = {}  # Track by normalized song name + artist
    max_week = 0
    
    for week, song_name, artist, youtube_id in matches:
        songs_by_id[youtube_id] = {
            'week': week,
            'songName': song_name,
            'artist': artist,
            'youtubeId': youtube_id
        }
        # Also track by normalized song name + artist (case-insensitive)
        normalized_key = f"{song_name.lower().strip()}|{artist.lower().strip()}"
        songs_by_name_artist[normalized_key] = {
            'week': week,
            'songName': song_name,
            'artist': artist,
            'youtubeId': youtube_id
        }
        # Extract week number
        week_num = int(re.search(r'\d+', week).group())
        max_week = max(max_week, week_num)
    
    return songs_by_id, songs_by_name_artist, max_week, content

def extract_video_id(video_id_or_url):
    """Extract video ID from various YouTube URL formats or return as-is"""
    patterns = [
        r'(?:youtube\.com\/watch\?v=|youtu\.be\/|youtube\.com\/embed\/)([a-zA-Z0-9_-]{11})',
        r'^([a-zA-Z0-9_-]{11})$'
    ]
    
    for pattern in patterns:
        match = re.search(pattern, video_id_or_url)
        if match:
            return match.group(1)
    
    return video_id_or_url

def format_song_entry(week_num, song_name, artist, youtube_id):
    """Format a song entry in the archive.ts format"""
    week_str = f"week {week_num:02d}"
    return f"""    {{
      week: "{week_str}",
      songName: "{song_name}",
      artist: "{artist}",
      youtubeId: "{youtube_id}"
    }}"""

def update_archive_file(existing_content, new_songs):
    """Update archive.ts with new songs"""
    # Handle empty array case: "return [\n  ]\n}"
    empty_array_pattern = r'(return\s+\[\s*\n\s*)(\]\s*\n\s*\})'
    empty_match = re.search(empty_array_pattern, existing_content)
    
    if empty_match:
        # Array is empty, just insert songs
        new_entries = ',\n'.join(new_songs)
        updated_content = re.sub(
            empty_array_pattern,
            f'return [\n{new_entries}\n  ]',
            existing_content,
            count=1
        )
        return updated_content
    
    # Handle non-empty array: find last } before ] }
    # Format: "    }\n  ]\n}"
    pattern = r'(\}\s*\n\s*)(\]\s*\n\s*\})'
    
    def replace_func(match):
        # Insert new songs before the closing bracket
        # Add comma after last entry, then new entries with proper formatting
        new_entries = ',\n'.join(new_songs)
        # match.group(1) is "    }\n" (closing brace of last entry)
        # match.group(2) is "  ]\n}" (closing brackets)
        return f'{match.group(1)},{new_entries}\n  {match.group(2)}'
    
    updated_content = re.sub(pattern, replace_func, existing_content, count=1)
    
    if updated_content == existing_content:
        raise ValueError("Failed to find insertion point in archive.ts. File format may have changed.")
    
    return updated_content

def main():
    # Initialize YouTube API client
    youtube = build('youtube', 'v3', developerKey=YOUTUBE_API_KEY)
    
    print(f"Fetching playlist items from playlist: {PLAYLIST_ID}")
    playlist_items = get_playlist_items(youtube, PLAYLIST_ID)
    print(f"Found {len(playlist_items)} items in playlist")
    
    # Parse existing archive
    existing_songs_by_id, existing_songs_by_name_artist, max_week, archive_content = parse_archive_file()
    print(f"Found {len(existing_songs_by_id)} existing songs in archive (max week: {max_week})")
    
    # Get video IDs to fetch actual channel information
    video_ids = [item['contentDetails']['videoId'] for item in playlist_items]
    print(f"Fetching video details to get actual channel information...")
    video_details = get_video_details(youtube, video_ids)
    
    # Process playlist items in order they appear in playlist
    new_songs = []
    new_week = max_week + 1
    
    for item in playlist_items:
        video_id = item['contentDetails']['videoId']
        snippet = item['snippet']
        title = snippet['title']
        
        # Skip if already in archive by video ID
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
        
        # Format entry
        entry = format_song_entry(new_week, song_name, artist, video_id)
        new_songs.append(entry)
        
        print(f"  Adding: week {new_week:02d} - {song_name} by {artist} ({video_id})")
        new_week += 1
    
    if not new_songs:
        print("No new songs to add!")
        return
    
    print(f"\nAdding {len(new_songs)} new song(s) to archive...")
    
    # Update archive file
    updated_content = update_archive_file(archive_content, new_songs)
    
    # Write back to file
    with open(ARCHIVE_FILE, 'w', encoding='utf-8') as f:
        f.write(updated_content)
    
    print(f"Successfully updated {ARCHIVE_FILE}")

if __name__ == '__main__':
    main()

