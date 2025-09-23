import { useState, useEffect } from "react";
import { Calendar, MapPin, Clock, Star } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import CountdownTimer from "@/components/CountdownTimer";
import WavePattern from "@/components/WavePattern";
import posterImage from "@/assets/rendezvous-poster.jpeg";

const Index = () => {
  // Set festival start date (today)
  const festivalStartDate = new Date();
  festivalStartDate.setHours(9, 0, 0, 0); // 9 AM today

  const navItems = [
    { name: "Schedule", href: "/schedule", icon: Calendar, description: "View event timeline" },
    { name: "Results", href: "/results", icon: Star, description: "Competition results" },
    { name: "Leaderboard", href: "/leaderboard", icon: Star, description: "Top performers" },
    { name: "Gallery", href: "/gallery", icon: Star, description: "Festival moments" },
    { name: "Announcements", href: "/announcements", icon: Star, description: "Latest updates" },
  ];

  return (
    <div className="min-h-screen flex flex-col bg-gradient-to-br from-background via-background to-secondary/10">
      <Header />
      
      <main className="flex-1">
        {/* Hero Section */}
        <section className="relative overflow-hidden">
          <div 
            className="absolute inset-0 bg-cover bg-center bg-no-repeat opacity-20"
            style={{ backgroundImage: `url(${posterImage})` }}
          />
          <div className="absolute inset-0 bg-gradient-to-br from-background/90 via-background/70 to-background/90" />
          
          <div className="relative container mx-auto px-4 py-16 lg:py-24">
            <div className="text-center max-w-4xl mx-auto">
              {/* Logo */}
              <div className="flex items-center justify-center mb-6">
                <div className="h-16 w-16 bg-gradient-to-br from-red-500 to-orange-500 rounded-2xl flex items-center justify-center mr-4">
                  <span className="text-white font-bold text-2xl">R</span>
                </div>
                <div>
                  <h1 className="text-4xl lg:text-6xl font-bold bg-gradient-to-r from-red-500 via-orange-500 to-blue-500 bg-clip-text text-transparent">
                    RENDEZVOUS
                  </h1>
                  <p className="text-lg text-muted-foreground">Silver Edition</p>
                </div>
              </div>

              {/* Theme */}
              <div className="mb-8">
                <WavePattern className="mx-auto max-w-md mb-4" />
                <h2 className="text-2xl lg:text-3xl font-light text-foreground tracking-wide">
                  Transcending Illusions
                </h2>
                <WavePattern className="mx-auto max-w-md mt-4" />
              </div>

              {/* Event Info */}
              <div className="flex flex-wrap items-center justify-center gap-6 mb-12 text-muted-foreground">
                <div className="flex items-center space-x-2">
                  <Calendar className="h-5 w-5 text-primary" />
                  <span>September 19-20, 2025</span>
                </div>
                <div className="flex items-center space-x-2">
                  <MapPin className="h-5 w-5 text-primary" />
                  <span>Markaz Mihraj Malayil</span>
                </div>
                <div className="flex items-center space-x-2">
                  <Clock className="h-5 w-5 text-primary" />
                  <span>Mi'araj Life Festival</span>
                </div>
              </div>

              {/* Countdown */}
              <div className="mb-12">
                <h3 className="text-xl font-semibold mb-6 text-foreground">Festival Countdown</h3>
                <CountdownTimer targetDate={festivalStartDate} />
              </div>

              {/* Description */}
              <p className="text-lg text-muted-foreground max-w-2xl mx-auto leading-relaxed">
                The 25th edition of Jamia Madeenathunnoor's Life Festival, marking a milestone in the institution's commitment to artistic excellence and student development.
              </p>
            </div>
          </div>
        </section>

        {/* Navigation Cards */}
        <section className="py-16 bg-card/50">
          <div className="container mx-auto px-4">
            <h2 className="text-3xl font-bold text-center mb-12 text-foreground">
              Explore Festival
            </h2>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 max-w-6xl mx-auto">
              {navItems.map((item) => (
                <Card key={item.name} className="group hover:shadow-lg transition-all duration-300 hover:scale-105 border-2 hover:border-primary/50">
                  <CardContent className="p-6">
                    <div className="flex items-center space-x-4 mb-4">
                      <div className="h-12 w-12 bg-gradient-to-br from-primary to-secondary rounded-xl flex items-center justify-center group-hover:scale-110 transition-transform">
                        <item.icon className="h-6 w-6 text-primary-foreground" />
                      </div>
                      <div>
                        <h3 className="text-xl font-semibold text-foreground group-hover:text-primary transition-colors">
                          {item.name}
                        </h3>
                        <p className="text-sm text-muted-foreground">{item.description}</p>
                      </div>
                    </div>
                    <Button asChild variant="outline" className="w-full group-hover:bg-primary group-hover:text-primary-foreground">
                      <a href={item.href}>
                        Explore {item.name}
                      </a>
                    </Button>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </section>

        {/* Festival Highlights */}
        <section className="py-16">
          <div className="container mx-auto px-4 text-center">
            <h2 className="text-3xl font-bold mb-8 text-foreground">Festival Highlights</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-4xl mx-auto">
              <div className="space-y-4">
                <div className="h-16 w-16 bg-gradient-to-br from-red-500 to-orange-500 rounded-full mx-auto flex items-center justify-center">
                  <Star className="h-8 w-8 text-white" />
                </div>
                <h3 className="text-xl font-semibold text-foreground">Competitions</h3>
                <p className="text-muted-foreground">Showcase your talents in various artistic competitions</p>
              </div>
              <div className="space-y-4">
                <div className="h-16 w-16 bg-gradient-to-br from-orange-500 to-blue-500 rounded-full mx-auto flex items-center justify-center">
                  <Calendar className="h-8 w-8 text-white" />
                </div>
                <h3 className="text-xl font-semibold text-foreground">Workshops</h3>
                <p className="text-muted-foreground">Learn from experts in interactive sessions</p>
              </div>
              <div className="space-y-4">
                <div className="h-16 w-16 bg-gradient-to-br from-blue-500 to-red-500 rounded-full mx-auto flex items-center justify-center">
                  <MapPin className="h-8 w-8 text-white" />
                </div>
                <h3 className="text-xl font-semibold text-foreground">Cultural Events</h3>
                <p className="text-muted-foreground">Experience diverse cultural performances</p>
              </div>
            </div>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
};

export default Index;
