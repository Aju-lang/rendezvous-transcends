import { useState, useEffect } from "react";
import { Crown, Trophy, Medal, Award, Star } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { supabase } from "@/integrations/supabase/client";

interface LeaderboardEntry {
  participant: string;
  total_points: number;
  event_count: number;
  rank: number;
}

const Leaderboard = () => {
  const [leaderboard, setLeaderboard] = useState<LeaderboardEntry[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchLeaderboard();
  }, []);

  const fetchLeaderboard = async () => {
    try {
      const { data, error } = await supabase
        .from('leaderboard')
        .select('*')
        .order('rank', { ascending: true })
        .limit(50);

      if (error) throw error;
      setLeaderboard(data || []);
    } catch (error) {
      console.error('Error fetching leaderboard:', error);
    } finally {
      setLoading(false);
    }
  };

  const getRankIcon = (rank: number) => {
    switch (rank) {
      case 1:
        return <Crown className="h-6 w-6 text-yellow-500" />;
      case 2:
        return <Trophy className="h-6 w-6 text-gray-400" />;
      case 3:
        return <Medal className="h-6 w-6 text-amber-600" />;
      default:
        return <Award className="h-6 w-6 text-muted-foreground" />;
    }
  };

  const getRankColor = (rank: number) => {
    switch (rank) {
      case 1:
        return 'bg-gradient-to-r from-yellow-500/20 to-yellow-600/20 border-yellow-500/40';
      case 2:
        return 'bg-gradient-to-r from-gray-400/20 to-gray-500/20 border-gray-400/40';
      case 3:
        return 'bg-gradient-to-r from-amber-600/20 to-amber-700/20 border-amber-600/40';
      default:
        return 'bg-muted/20 border-muted';
    }
  };

  const getTopThree = () => leaderboard.slice(0, 3);
  const getRestOfLeaderboard = () => leaderboard.slice(3);

  if (loading) {
    return (
      <div className="min-h-screen flex flex-col bg-gradient-to-br from-background via-background to-secondary/10">
        <Header />
        <div className="flex-1 flex items-center justify-center">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
            <p className="text-muted-foreground">Loading leaderboard...</p>
          </div>
        </div>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col bg-gradient-to-br from-background via-background to-secondary/10">
      <Header />
      
      <main className="flex-1 py-8">
        <div className="container mx-auto px-4">
          {/* Header */}
          <div className="text-center mb-8">
            <h1 className="text-4xl font-bold bg-gradient-to-r from-red-500 to-orange-500 bg-clip-text text-transparent mb-4">
              Leaderboard
            </h1>
            <p className="text-muted-foreground max-w-2xl mx-auto">
              Top performers ranked by total points earned across all competitions
            </p>
          </div>

          {leaderboard.length === 0 ? (
            <div className="text-center py-12">
              <Trophy className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-xl font-semibold text-foreground mb-2">No Rankings Yet</h3>
              <p className="text-muted-foreground mb-6">
                The leaderboard will populate as competition results are announced
              </p>
            </div>
          ) : (
            <div className="space-y-8">
              {/* Top 3 Podium */}
              {getTopThree().length > 0 && (
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-4xl mx-auto">
                  {getTopThree().map((entry, index) => (
                    <Card 
                      key={entry.participant} 
                      className={`text-center p-6 ${getRankColor(entry.rank)} ${
                        entry.rank === 1 ? 'order-2 md:order-2 transform md:scale-110' : 
                        entry.rank === 2 ? 'order-1 md:order-1' : 
                        'order-3 md:order-3'
                      }`}
                    >
                      <CardContent className="space-y-4">
                        <div className="flex justify-center">
                          {getRankIcon(entry.rank)}
                        </div>
                        <div>
                          <h3 className="text-xl font-bold text-foreground">
                            {entry.participant}
                          </h3>
                          <p className="text-2xl font-bold text-primary">
                            {entry.total_points} pts
                          </p>
                          <p className="text-sm text-muted-foreground">
                            {entry.event_count} events
                          </p>
                        </div>
                        <Badge className={`${
                          entry.rank === 1 ? 'bg-yellow-500/20 text-yellow-600' :
                          entry.rank === 2 ? 'bg-gray-400/20 text-gray-600' :
                          'bg-amber-600/20 text-amber-600'
                        }`}>
                          #{entry.rank}
                        </Badge>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              )}

              {/* Rest of Leaderboard */}
              {getRestOfLeaderboard().length > 0 && (
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center space-x-2">
                      <Star className="h-6 w-6 text-primary" />
                      <span>Full Rankings</span>
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      {getRestOfLeaderboard().map((entry) => (
                        <div 
                          key={entry.participant}
                          className="flex items-center justify-between p-4 rounded-lg bg-muted/20 hover:bg-muted/30 transition-colors"
                        >
                          <div className="flex items-center space-x-4">
                            <div className="flex items-center justify-center h-10 w-10 rounded-full bg-muted text-sm font-bold">
                              #{entry.rank}
                            </div>
                            <div>
                              <h4 className="font-semibold text-foreground">
                                {entry.participant}
                              </h4>
                              <p className="text-sm text-muted-foreground">
                                {entry.event_count} events participated
                              </p>
                            </div>
                          </div>
                          
                          <div className="text-right">
                            <p className="text-xl font-bold text-primary">
                              {entry.total_points}
                            </p>
                            <p className="text-xs text-muted-foreground">
                              points
                            </p>
                          </div>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              )}
            </div>
          )}
        </div>
      </main>

      <Footer />
    </div>
  );
};

export default Leaderboard;