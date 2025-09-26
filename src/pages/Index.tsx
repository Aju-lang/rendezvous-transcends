import { useState, useEffect } from "react";
import { Calendar, MapPin, Clock, Star, Settings, Sparkles, Crown, Zap, Trophy, Image, Megaphone } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
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
    { name: "Schedule", href: "/schedule", icon: Calendar, description: "View event timeline", color: "from-blue-500 to-blue-600", festive: "📅" },
    { name: "Results", href: "/results", icon: Trophy, description: "Competition results", color: "from-yellow-500 to-yellow-600", festive: "🏆" },
    { name: "Leaderboard", href: "/leaderboard", icon: Crown, description: "Top performers", color: "from-purple-500 to-purple-600", festive: "👑" },
    { name: "Gallery", href: "/gallery", icon: Image, description: "Festival moments", color: "from-green-500 to-green-600", festive: "📸" },
    { name: "Announcements", href: "/announcements", icon: Megaphone, description: "Latest updates", color: "from-orange-500 to-orange-600", festive: "📢" },
  ];

  const adminItem = { name: "Admin Portal", href: "/auth", icon: Settings, description: "Admin access" };

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
          
          {/* Festive Background Elements */}
          <div className="absolute inset-0 overflow-hidden">
            <div className="absolute top-20 left-10 w-20 h-20 rounded-full bg-gradient-to-br from-yellow-400/30 to-red-500/30 animate-pulse"></div>
            <div className="absolute top-40 right-20 w-16 h-16 rounded-full bg-gradient-to-br from-orange-400/30 to-pink-500/30 animate-bounce"></div>
            <div className="absolute bottom-40 left-20 w-12 h-12 rounded-full bg-gradient-to-br from-blue-400/30 to-purple-500/30 animate-ping"></div>
            <div className="absolute bottom-20 right-10 w-24 h-24 rounded-full bg-gradient-to-br from-green-400/30 to-yellow-500/30 animate-pulse"></div>
          </div>
          
          <div className="relative container mx-auto px-4 py-16 lg:py-24">
            <div className="text-center max-w-4xl mx-auto">
              {/* Logo */}
              <div className="flex items-center justify-center mb-6">
                <div className="relative">
                  <div className="h-16 w-16 bg-gradient-to-br from-red-500 to-orange-500 rounded-2xl flex items-center justify-center mr-4 animate-pulse">
                    <span className="text-white font-bold text-2xl">R</span>
                  </div>
                  <div className="absolute -top-2 -right-2">
                    <Sparkles className="h-6 w-6 text-yellow-400 animate-bounce" />
                  </div>
                </div>
                <div>
                  <h1 className="text-4xl lg:text-6xl font-bold bg-gradient-to-r from-red-500 via-orange-500 to-blue-500 bg-clip-text text-transparent animate-pulse">
                    RENDEZVOUS
                  </h1>
                  <div className="flex items-center justify-center gap-2">
                    <Crown className="h-5 w-5 text-yellow-500 animate-pulse" />
                    <p className="text-lg text-muted-foreground">Silver Edition</p>
                    <Crown className="h-5 w-5 text-yellow-500 animate-pulse" />
                  </div>
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
                <div className="flex items-center space-x-2 bg-card/50 backdrop-blur-sm rounded-full px-4 py-2 border border-primary/20">
                  <Calendar className="h-5 w-5 text-primary animate-pulse" />
                  <span className="font-medium">September 19-20, 2025</span>
                  <Sparkles className="h-4 w-4 text-yellow-500" />
                </div>
                <div className="flex items-center space-x-2 bg-card/50 backdrop-blur-sm rounded-full px-4 py-2 border border-primary/20">
                  <MapPin className="h-5 w-5 text-primary animate-pulse" />
                  <span className="font-medium">Markaz Mihraj Malayil</span>
                  <Sparkles className="h-4 w-4 text-yellow-500" />
                </div>
                <div className="flex items-center space-x-2 bg-card/50 backdrop-blur-sm rounded-full px-4 py-2 border border-primary/20">
                  <Clock className="h-5 w-5 text-primary animate-pulse" />
                  <span className="font-medium">Mi'araj Life Festival</span>
                  <Sparkles className="h-4 w-4 text-yellow-500" />
                </div>
              </div>

              {/* Countdown */}
              <div className="mb-12">
                <div className="flex items-center justify-center gap-3 mb-6">
                  <Zap className="h-6 w-6 text-yellow-500 animate-pulse" />
                  <h3 className="text-xl font-semibold text-foreground">Festival Countdown</h3>
                  <Zap className="h-6 w-6 text-yellow-500 animate-pulse" />
                </div>
                <div className="bg-gradient-to-br from-yellow-500/10 to-orange-500/10 backdrop-blur-sm rounded-2xl p-6 border border-yellow-500/20">
                  <CountdownTimer targetDate={festivalStartDate} />
                </div>
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
              {navItems.map((item, index) => (
                <Card key={item.name} className="group hover:shadow-xl transition-all duration-300 hover:scale-105 border-2 hover:border-primary/50 relative overflow-hidden bg-gradient-to-br from-card/50 to-card/30 backdrop-blur-sm">
                  {/* Festive Background Pattern */}
                  <div className="absolute inset-0 opacity-5">
                    <div className={`absolute ${index % 2 === 0 ? 'top-4 right-4' : 'bottom-4 left-4'} w-16 h-16 rounded-full bg-gradient-to-br from-yellow-400 to-red-500 animate-pulse`}></div>
                    <div className={`absolute ${index % 2 === 0 ? 'bottom-6 left-6' : 'top-6 right-6'} w-8 h-8 rounded-full bg-gradient-to-br from-orange-400 to-pink-500 animate-bounce`}></div>
                  </div>
                  
                  <CardContent className="p-6 relative z-10">
                    <div className="flex items-center space-x-4 mb-4">
                      <div className="relative">
                        <div className={`h-12 w-12 bg-gradient-to-br ${item.color} rounded-xl flex items-center justify-center group-hover:scale-110 transition-transform`}>
                          <item.icon className="h-6 w-6 text-white" />
                        </div>
                        <div className="absolute -top-1 -right-1 w-4 h-4 bg-yellow-400 rounded-full animate-ping"></div>
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <h3 className="text-xl font-semibold text-foreground group-hover:text-primary transition-colors">
                            {item.name}
                          </h3>
                          <span className="text-lg">{item.festive}</span>
                        </div>
                        <p className="text-sm text-muted-foreground">{item.description}</p>
                      </div>
                    </div>
                    <Button asChild variant="outline" className="w-full group-hover:bg-primary group-hover:text-primary-foreground group-hover:scale-105 transition-all duration-300">
                      <a href={item.href}>
                        <Sparkles className="h-4 w-4 mr-2" />
                        Explore {item.name}
                      </a>
                    </Button>
                  </CardContent>
                </Card>
              ))}
              
              {/* Admin Portal Card */}
              <Card className="group hover:shadow-xl transition-all duration-300 hover:scale-105 border-2 hover:border-red-500/50 bg-gradient-to-br from-red-500/10 to-orange-500/10 relative overflow-hidden backdrop-blur-sm">
                {/* Festive Background Pattern */}
                <div className="absolute inset-0 opacity-10">
                  <div className="absolute top-4 right-4 w-16 h-16 rounded-full bg-gradient-to-br from-red-400 to-orange-500 animate-pulse"></div>
                  <div className="absolute bottom-6 left-6 w-8 h-8 rounded-full bg-gradient-to-br from-yellow-400 to-red-500 animate-bounce"></div>
                </div>
                
                <CardContent className="p-6 relative z-10">
                  <div className="flex items-center space-x-4 mb-4">
                    <div className="relative">
                      <div className="h-12 w-12 bg-gradient-to-br from-red-500 to-orange-500 rounded-xl flex items-center justify-center group-hover:scale-110 transition-transform">
                        <adminItem.icon className="h-6 w-6 text-white" />
                      </div>
                      <div className="absolute -top-1 -right-1 w-4 h-4 bg-yellow-400 rounded-full animate-ping"></div>
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <h3 className="text-xl font-semibold text-foreground group-hover:text-red-500 transition-colors">
                          {adminItem.name}
                        </h3>
                        <Crown className="h-5 w-5 text-yellow-500 animate-pulse" />
                      </div>
                      <p className="text-sm text-muted-foreground">{adminItem.description}</p>
                    </div>
                  </div>
                  <Button asChild variant="outline" className="w-full group-hover:bg-red-500 group-hover:text-white border-red-500/50 group-hover:scale-105 transition-all duration-300">
                    <a href={adminItem.href}>
                      <Crown className="h-4 w-4 mr-2" />
                      Access Admin
                    </a>
                  </Button>
                </CardContent>
              </Card>
            </div>
          </div>
        </section>

        {/* Festival Highlights */}
        <section className="py-16 relative overflow-hidden">
          {/* Festive Background */}
          <div className="absolute inset-0 opacity-5">
            <div className="absolute top-10 left-10 w-32 h-32 rounded-full bg-gradient-to-br from-yellow-400 to-red-500 animate-pulse"></div>
            <div className="absolute bottom-10 right-10 w-24 h-24 rounded-full bg-gradient-to-br from-orange-400 to-pink-500 animate-bounce"></div>
            <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-16 h-16 rounded-full bg-gradient-to-br from-blue-400 to-purple-500 animate-ping"></div>
          </div>
          
          <div className="container mx-auto px-4 text-center relative z-10">
            <div className="flex items-center justify-center gap-3 mb-8">
              <Sparkles className="h-8 w-8 text-yellow-500 animate-bounce" />
              <h2 className="text-3xl font-bold text-foreground bg-gradient-to-r from-yellow-600 to-orange-600 bg-clip-text text-transparent">
                Festival Highlights
              </h2>
              <Sparkles className="h-8 w-8 text-yellow-500 animate-bounce" />
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-4xl mx-auto">
              <div className="space-y-4 group">
                <div className="relative mx-auto w-fit">
                  <div className="h-16 w-16 bg-gradient-to-br from-red-500 to-orange-500 rounded-full flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
                    <Trophy className="h-8 w-8 text-white" />
                  </div>
                  <div className="absolute -top-2 -right-2 w-6 h-6 bg-yellow-400 rounded-full animate-ping"></div>
                </div>
                <h3 className="text-xl font-semibold text-foreground group-hover:text-red-500 transition-colors">Competitions</h3>
                <p className="text-muted-foreground">Showcase your talents in various artistic competitions</p>
                <Badge variant="secondary" className="bg-red-500/20 text-red-600">
                  <Star className="h-3 w-3 mr-1" />
                  Exciting Prizes
                </Badge>
              </div>
              
              <div className="space-y-4 group">
                <div className="relative mx-auto w-fit">
                  <div className="h-16 w-16 bg-gradient-to-br from-orange-500 to-blue-500 rounded-full flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
                    <Calendar className="h-8 w-8 text-white" />
                  </div>
                  <div className="absolute -top-2 -right-2 w-6 h-6 bg-yellow-400 rounded-full animate-ping"></div>
                </div>
                <h3 className="text-xl font-semibold text-foreground group-hover:text-orange-500 transition-colors">Workshops</h3>
                <p className="text-muted-foreground">Learn from experts in interactive sessions</p>
                <Badge variant="secondary" className="bg-orange-500/20 text-orange-600">
                  <Sparkles className="h-3 w-3 mr-1" />
                  Interactive Learning
                </Badge>
              </div>
              
              <div className="space-y-4 group">
                <div className="relative mx-auto w-fit">
                  <div className="h-16 w-16 bg-gradient-to-br from-blue-500 to-red-500 rounded-full flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
                    <MapPin className="h-8 w-8 text-white" />
                  </div>
                  <div className="absolute -top-2 -right-2 w-6 h-6 bg-yellow-400 rounded-full animate-ping"></div>
                </div>
                <h3 className="text-xl font-semibold text-foreground group-hover:text-blue-500 transition-colors">Cultural Events</h3>
                <p className="text-muted-foreground">Experience diverse cultural performances</p>
                <Badge variant="secondary" className="bg-blue-500/20 text-blue-600">
                  <Crown className="h-3 w-3 mr-1" />
                  Rich Heritage
                </Badge>
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