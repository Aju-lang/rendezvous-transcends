-- Update leaderboard view to automatically calculate from results
DROP VIEW IF EXISTS public.leaderboard;

CREATE VIEW public.leaderboard AS
SELECT 
  participant,
  SUM(
    CASE 
      WHEN position = 1 THEN 10
      WHEN position = 2 THEN 7  
      WHEN position = 3 THEN 5
      WHEN position <= 5 THEN 3
      ELSE 1
    END
  ) as total_points,
  COUNT(*) as event_count,
  ROW_NUMBER() OVER (ORDER BY SUM(
    CASE 
      WHEN position = 1 THEN 10
      WHEN position = 2 THEN 7
      WHEN position = 3 THEN 5  
      WHEN position <= 5 THEN 3
      ELSE 1
    END
  ) DESC) as rank
FROM public.results
GROUP BY participant
ORDER BY total_points DESC;