import { useState, useEffect } from "react";
import { Trophy, Medal, Award, Image as ImageIcon } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { supabase } from "@/integrations/supabase/client";

interface Result {
  id: string;
  event_id: string;
  participant: string;
  position: number;
  points: number;
  image_url?: string;
  schedule?: {
    event_name: string;
    category: string;
  };
}

const Results = () => {
  const [results, setResults] = useState<Result[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchResults();
  }, []);

  const fetchResults = async () => {
    try {
      const { data, error } = await supabase
        .from('results')
        .select(`
          *,
          schedule (
            event_name,
            category
          )
        `)
        .order('position', { ascending: true });

      if (error) throw error;
      setResults(data || []);
    } catch (error) {
      console.error('Error fetching results:', error);
    } finally {
      setLoading(false);
    }
  };

  const getPositionIcon = (position: number) => {
    switch (position) {
      case 1:
        return <Trophy className="h-6 w-6 text-yellow-500" />;
      case 2:
        return <Medal className="h-6 w-6 text-gray-400" />;
      case 3:
        return <Award className="h-6 w-6 text-amber-600" />;
      default:
        return <div className="h-6 w-6 rounded-full bg-muted flex items-center justify-center text-xs font-bold">{position}</div>;
    }
  };

  const getPositionColor = (position: number) => {
    switch (position) {
      case 1:
        return 'bg-yellow-500/10 text-yellow-600 border-yellow-500/20';
      case 2:
        return 'bg-gray-400/10 text-gray-600 border-gray-400/20';
      case 3:
        return 'bg-amber-600/10 text-amber-600 border-amber-600/20';
      default:
        return 'bg-muted/50 text-muted-foreground border-muted';
    }
  };

  const groupResultsByEvent = (results: Result[]) => {
    return results.reduce((groups, result) => {
      const eventName = result.schedule?.event_name || 'Unknown Event';
      if (!groups[eventName]) {
        groups[eventName] = [];
      }
      groups[eventName].push(result);
      return groups;
    }, {} as Record<string, Result[]>);
  };

  const groupedResults = groupResultsByEvent(results);

  if (loading) {
    return (
      <div className="min-h-screen flex flex-col bg-gradient-to-br from-background via-background to-secondary/10">
        <Header />
        <div className="flex-1 flex items-center justify-center">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
            <p className="text-muted-foreground">Loading results...</p>
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
              Competition Results
            </h1>
            <p className="text-muted-foreground max-w-2xl mx-auto">
              Live results from all competitions. Results are updated in real-time as events conclude.
            </p>
          </div>

          {/* Results */}
          {Object.keys(groupedResults).length === 0 ? (
            <div className="text-center py-12">
              <Trophy className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-xl font-semibold text-foreground mb-2">No Results Yet</h3>
              <p className="text-muted-foreground mb-6">
                Competition results will appear here as events conclude. Check back soon!
              </p>
              <Button asChild variant="outline">
                <a href="/schedule">View Schedule</a>
              </Button>
            </div>
          ) : (
            <div className="space-y-8">
              {Object.entries(groupedResults).map(([eventName, eventResults]) => (
                <Card key={eventName} className="overflow-hidden">
                  <CardHeader className="bg-gradient-to-r from-primary/10 to-secondary/10">
                    <CardTitle className="text-2xl font-bold text-foreground flex items-center space-x-2">
                      <Trophy className="h-6 w-6 text-primary" />
                      <span>{eventName}</span>
                    </CardTitle>
                    {eventResults[0]?.schedule?.category && (
                      <Badge className="w-fit">
                        {eventResults[0].schedule.category}
                      </Badge>
                    )}
                  </CardHeader>
                  <CardContent className="p-6">
                    <div className="space-y-4">
                      {eventResults
                        .sort((a, b) => a.position - b.position)
                        .map((result, index) => (
                          <div 
                            key={result.id} 
                            className={`flex items-center justify-between p-4 rounded-lg border ${
                              index < 3 ? 'bg-gradient-to-r from-primary/5 to-secondary/5' : 'bg-muted/20'
                            }`}
                          >
                            <div className="flex items-center space-x-4">
                              {getPositionIcon(result.position)}
                              <div>
                                <h4 className="font-semibold text-foreground text-lg">
                                  {result.participant}
                                </h4>
                                <div className="flex items-center space-x-2">
                                  <Badge className={getPositionColor(result.position)}>
                                    {result.position === 1 ? '1st Place' : 
                                     result.position === 2 ? '2nd Place' : 
                                     result.position === 3 ? '3rd Place' : 
                                     `${result.position}th Place`}
                                  </Badge>
                                  {result.points > 0 && (
                                    <Badge variant="outline">
                                      {result.points} points
                                    </Badge>
                                  )}
                                </div>
                              </div>
                            </div>
                            
                            {result.image_url && (
                              <Button size="sm" variant="outline" asChild>
                                <a href={result.image_url} target="_blank" rel="noopener noreferrer">
                                  <ImageIcon className="h-4 w-4 mr-2" />
                                  View Certificate
                                </a>
                              </Button>
                            )}
                          </div>
                        ))}
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </div>
      </main>

      <Footer />
    </div>
  );
};

export default Results;