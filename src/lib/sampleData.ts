import { supabase } from '@/integrations/supabase/client';

// Sample data for testing the festival management system
export const createSampleData = async () => {
  try {
    // Sample Schedule Events
    const sampleEvents = [
      {
        event_name: "Opening Ceremony",
        category: "Cultural",
        date: "2025-09-19",
        time: "09:00",
        venue: "Main Auditorium",
        description: "Grand opening ceremony with cultural performances",
        document_url: "https://example.com/opening-ceremony-schedule.pdf",
        document_name: "Opening Ceremony Schedule.pdf",
        document_type: "application/pdf"
      },
      {
        event_name: "Sports Competition",
        category: "Sports",
        date: "2025-09-19",
        time: "10:00",
        venue: "Sports Complex",
        description: "Various sports competitions including football, basketball, and athletics",
        document_url: "https://example.com/sports-rules.pdf",
        document_name: "Sports Competition Rules.pdf",
        document_type: "application/pdf"
      },
      {
        event_name: "Art Exhibition",
        category: "Arts",
        date: "2025-09-19",
        time: "14:00",
        venue: "Art Gallery",
        description: "Student artwork exhibition showcasing creative talents"
      },
      {
        event_name: "Music Concert",
        category: "Music",
        date: "2025-09-20",
        time: "19:00",
        venue: "Concert Hall",
        description: "Evening music concert featuring student bands and solo performances",
        document_url: "https://example.com/concert-lineup.pdf",
        document_name: "Concert Lineup.pdf",
        document_type: "application/pdf"
      },
      {
        event_name: "Closing Ceremony",
        category: "Cultural",
        date: "2025-09-20",
        time: "21:00",
        venue: "Main Auditorium",
        description: "Award ceremony and closing performances"
      }
    ];

    // Sample Announcements
    const sampleAnnouncements = [
      {
        title: "Welcome to Rendezvous Silver Edition!",
        content: "Welcome everyone to the 25th edition of our Life Festival. We're excited to have you all here for this amazing celebration of talent and creativity.",
        priority: "high" as const,
        category: "General",
        is_active: true
      },
      {
        title: "Sports Competition Schedule",
        content: "All sports competitions will begin at 10:00 AM sharp. Please report to the Sports Complex 15 minutes early for registration.",
        priority: "urgent" as const,
        category: "Sports",
        is_active: true
      },
      {
        title: "Art Exhibition Opening",
        content: "The art exhibition will open at 2:00 PM today. Come and admire the incredible artwork created by our talented students.",
        priority: "medium" as const,
        category: "Arts",
        is_active: true
      },
      {
        title: "Music Concert Tonight",
        content: "Don't miss the spectacular music concert tonight at 7:00 PM in the Concert Hall. Featuring amazing performances by our student musicians.",
        priority: "high" as const,
        category: "Music",
        is_active: true
      }
    ];

    // Sample Gallery Items (with placeholder images)
    const sampleGallery = [
      {
        title: "Opening Ceremony Performance",
        description: "Beautiful cultural dance performance during the opening ceremony",
        image_url: "https://images.unsplash.com/photo-1547036967-23d11aacaee0?w=800&h=600&fit=crop",
        event_name: "Opening Ceremony",
        category: "Cultural",
        likes_count: 0
      },
      {
        title: "Sports Competition Action",
        description: "Exciting moments from the football match",
        image_url: "https://images.unsplash.com/photo-1574629810360-7efbbe195018?w=800&h=600&fit=crop",
        event_name: "Sports Competition",
        category: "Sports",
        likes_count: 0
      },
      {
        title: "Art Exhibition Display",
        description: "Student artwork on display at the gallery",
        image_url: "https://images.unsplash.com/photo-1541961017774-22349e4a1262?w=800&h=600&fit=crop",
        event_name: "Art Exhibition",
        category: "Arts",
        likes_count: 0
      },
      {
        title: "Music Concert Stage",
        description: "Amazing stage setup for the evening concert",
        image_url: "https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f?w=800&h=600&fit=crop",
        event_name: "Music Concert",
        category: "Music",
        likes_count: 0
      }
    ];

    // Insert sample data
    console.log("Creating sample data...");

    // Insert events
    const { error: eventsError } = await supabase
      .from('schedule')
      .insert(sampleEvents);
    
    if (eventsError) {
      console.warn("Events error:", eventsError);
    } else {
      console.log("✅ Sample events created");
    }

    // Insert announcements
    const { error: announcementsError } = await supabase
      .from('announcements')
      .insert(sampleAnnouncements);
    
    if (announcementsError) {
      console.warn("Announcements error:", announcementsError);
    } else {
      console.log("✅ Sample announcements created");
    }

    // Insert gallery items
    const { error: galleryError } = await supabase
      .from('gallery')
      .insert(sampleGallery);
    
    if (galleryError) {
      console.warn("Gallery error:", galleryError);
    } else {
      console.log("✅ Sample gallery items created");
    }

    // Sample Results with Photos
    const sampleResults = [
      {
        event_id: sampleEvents[0].id, // Opening Ceremony
        participant: "John Smith",
        position: 1,
        points: 10,
        photos: [
          "https://images.unsplash.com/photo-1547036967-23d11aacaee0?w=400&h=300&fit=crop",
          "https://images.unsplash.com/photo-1574629810360-7efbbe195018?w=400&h=300&fit=crop"
        ],
        photo_count: 2
      },
      {
        event_id: sampleEvents[1].id, // Sports Competition
        participant: "Sarah Johnson",
        position: 1,
        points: 10,
        photos: [
          "https://images.unsplash.com/photo-1574629810360-7efbbe195018?w=400&h=300&fit=crop"
        ],
        photo_count: 1
      },
      {
        event_id: sampleEvents[1].id, // Sports Competition
        participant: "Mike Wilson",
        position: 2,
        points: 7,
        photos: [
          "https://images.unsplash.com/photo-1541961017774-22349e4a1262?w=400&h=300&fit=crop"
        ],
        photo_count: 1
      }
    ];

    // Insert sample results
    const { error: resultsError } = await supabase
      .from('results')
      .insert(sampleResults);
    
    if (resultsError) {
      console.warn("Results error:", resultsError);
    } else {
      console.log("✅ Sample results created");
    }

    console.log("🎉 Sample data creation completed!");
    return true;

  } catch (error) {
    console.error("Error creating sample data:", error);
    return false;
  }
};

// Function to clear all data (for testing)
export const clearAllData = async () => {
  try {
    console.log("Clearing all data...");
    
    await supabase.from('results').delete().neq('id', '00000000-0000-0000-0000-000000000000');
    await supabase.from('gallery').delete().neq('id', '00000000-0000-0000-0000-000000000000');
    await supabase.from('announcements').delete().neq('id', '00000000-0000-0000-0000-000000000000');
    await supabase.from('schedule').delete().neq('id', '00000000-0000-0000-0000-000000000000');
    
    console.log("✅ All data cleared");
    return true;
  } catch (error) {
    console.error("Error clearing data:", error);
    return false;
  }
};
