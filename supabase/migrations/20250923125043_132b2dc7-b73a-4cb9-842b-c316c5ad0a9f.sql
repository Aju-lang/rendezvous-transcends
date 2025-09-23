-- Fix security definer view issue by recreating the leaderboard view without SECURITY DEFINER
DROP VIEW IF EXISTS public.leaderboard;

CREATE VIEW public.leaderboard AS
SELECT 
  participant,
  SUM(points) as total_points,
  COUNT(*) as event_count,
  RANK() OVER (ORDER BY SUM(points) DESC) as rank
FROM public.results
GROUP BY participant
ORDER BY total_points DESC;