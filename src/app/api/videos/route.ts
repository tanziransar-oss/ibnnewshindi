import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { requireAdmin } from "@/lib/admin-auth";

export const runtime = "nodejs";

// Extract YouTube ID from various YouTube URL formats
function extractYoutubeId(input: string): string {
  const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|\&v=)([^#\&\?]*).*/;
  const match = input.match(regExp);
  return (match && match[2].length === 11) ? match[2] : input.trim();
}

// GET all videos ordered by date desc
export async function GET() {
  try {
    const list = await db
      .selectFrom("video")
      .selectAll()
      .orderBy("publishDate", "desc")
      .execute();
    return new NextResponse(JSON.stringify(list), {
      status: 200,
      headers: {
        "Content-Type": "application/json",
        "Cache-Control": "public, s-maxage=5, stale-while-revalidate=59",
      },
    });
  } catch (err) {
    console.error("Error fetching YouTube videos:", err);
    return NextResponse.json({ error: "Failed to load video catalog" }, { status: 500 });
  }
}

// POST a new YouTube video
export async function POST(request: Request) {
  try {
    const denied = await requireAdmin(request);
    if (denied) return denied;

    const body = await request.json();
    const { title, description, youtubeUrlOrId } = body;

    if (!title || !description) {
      return NextResponse.json({ error: "Title and description are required" }, { status: 400 });
    }

    let youtubeId = "";

    // If an explicit URL/ID was provided, use it
    if (youtubeUrlOrId && youtubeUrlOrId.trim()) {
      youtubeId = extractYoutubeId(youtubeUrlOrId);
    } else {
      // Auto-fetch from our channel's RSS feed (News18 India channel ID: UC14UjN1-30tq6o4_u3O6n5w)
      const channelId = "UC14UjN1-30tq6o4_u3O6n5w";
      try {
        const feedRes = await fetch(`https://www.youtube.com/feeds/videos.xml?channel_id=${channelId}`, {
          next: { revalidate: 60 } // cache for 1 minute
        });

        if (feedRes.ok) {
          const xml = await feedRes.text();
          const entries: { title: string; videoId: string }[] = [];
          
          // Custom regex to parse entries from keyless RSS feed
          const entryMatches = xml.matchAll(/<entry>([\s\S]*?)<\/entry>/g);
          for (const match of entryMatches) {
            const entryXml = match[1];
            const titleMatch = entryXml.match(/<title>([\s\S]*?)<\/title>/);
            const videoIdMatch = entryXml.match(/<yt:videoId>([\s\S]*?)<\/yt:videoId>/);
            if (titleMatch && videoIdMatch) {
              entries.push({
                title: titleMatch[1].trim(),
                videoId: videoIdMatch[1].trim()
              });
            }
          }

          if (entries.length > 0) {
            // Find the video entry that overlaps with our requested title
            const matched = entries.find(e => 
              e.title.toLowerCase().includes(title.toLowerCase()) || 
              title.toLowerCase().includes(e.title.toLowerCase())
            );
            youtubeId = matched ? matched.videoId : entries[0].videoId;
          }
        }
      } catch (feedErr) {
        console.error("Failed to query YouTube RSS feed:", feedErr);
      }
    }

    // Fallback if no video ID could be found or parsed
    if (!youtubeId || youtubeId.length !== 11) {
      youtubeId = "dQw4w9WgXcQ"; // Default fallback video ID
    }

    const newVideo = {
      id: "v_" + Date.now(),
      title,
      description,
      youtubeId,
      thumbnailUrl: `https://img.youtube.com/vi/${youtubeId}/maxresdefault.jpg`,
      publishDate: new Date(),
      views: 0,
    };

    await db.insertInto("video").values(newVideo).execute();
    return NextResponse.json(newVideo);
  } catch (err) {
    console.error("Error creating YouTube video record:", err);
    return NextResponse.json({ error: "Failed to register video record" }, { status: 500 });
  }
}

// DELETE a YouTube video
export async function DELETE(request: Request) {
  try {
    const denied = await requireAdmin(request);
    if (denied) return denied;

    const { id } = await request.json();
    if (!id) {
      return NextResponse.json({ error: "Missing video ID" }, { status: 400 });
    }
    await db.deleteFrom("video").where("id", "=", id).execute();
    return NextResponse.json({ success: true, id });
  } catch (err) {
    console.error("Error deleting YouTube video from Neon DB:", err);
    return NextResponse.json({ error: "Failed to delete video record" }, { status: 500 });
  }
}

