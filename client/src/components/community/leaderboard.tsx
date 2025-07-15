import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Skeleton } from "@/components/ui/skeleton";
import { Trophy, Medal, Award, Clock, Target, TrendingUp } from "lucide-react";
import { useState } from "react";
import { format } from "date-fns";

interface LeaderboardEntry {
  rank: number;
  user: {
    id: string;
    firstName: string;
    lastName: string;
    profileImageUrl?: string;
  };
  score: number;
  humanReadableScore: string;
  scaleType: string;
  workout: {
    name: string;
    type: string;
  };
  date: string;
}

interface CommunityLeaderboardProps {
  communityId: number;
}

export function CommunityLeaderboard({ communityId }: CommunityLeaderboardProps) {
  const [selectedWorkout, setSelectedWorkout] = useState<string>("");
  const [selectedDate, setSelectedDate] = useState<string>(format(new Date(), "yyyy-MM-dd"));

  const { data: leaderboard, isLoading } = useQuery({
    queryKey: ["/api/leaderboard/community", communityId, selectedWorkout, selectedDate],
    queryFn: async () => {
      const params = new URLSearchParams();
      if (selectedWorkout) params.set("workout", selectedWorkout);
      if (selectedDate) params.set("date", selectedDate);
      
      const response = await fetch(`/api/leaderboard/community/${communityId}?${params}`);
      if (!response.ok) throw new Error("Failed to fetch leaderboard");
      return response.json();
    }
  });

  const getRankIcon = (rank: number) => {
    switch (rank) {
      case 1:
        return <Trophy className="h-5 w-5 text-yellow-500" />;
      case 2:
        return <Medal className="h-5 w-5 text-gray-400" />;
      case 3:
        return <Award className="h-5 w-5 text-amber-600" />;
      default:
        return <span className="font-bold text-gray-600">#{rank}</span>;
    }
  };

  const getRankBadgeColor = (rank: number) => {
    switch (rank) {
      case 1:
        return "bg-yellow-500";
      case 2:
        return "bg-gray-400";
      case 3:
        return "bg-amber-600";
      default:
        return "bg-gray-300";
    }
  };

  const formatScore = (entry: LeaderboardEntry) => {
    if (entry.humanReadableScore) {
      return entry.humanReadableScore;
    }
    
    if (entry.workout.type === "for_time" || entry.workout.type === "chipper") {
      const minutes = Math.floor(entry.score / 60);
      const seconds = Math.floor(entry.score % 60);
      return `${minutes}:${seconds.toString().padStart(2, '0')}`;
    }
    
    return entry.score.toString();
  };

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <Trophy className="h-5 w-5 mr-2" />
            Community Leaderboard
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {[1, 2, 3, 4, 5].map((i) => (
            <div key={i} className="flex items-center space-x-4">
              <Skeleton className="h-10 w-10 rounded-full" />
              <div className="flex-1">
                <Skeleton className="h-4 w-32 mb-2" />
                <Skeleton className="h-3 w-20" />
              </div>
              <Skeleton className="h-6 w-16" />
            </div>
          ))}
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center">
          <Trophy className="h-5 w-5 mr-2 text-primary" />
          Community Leaderboard
        </CardTitle>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
          <div>
            <Label>Filter by Workout</Label>
            <Input
              placeholder="Enter workout name..."
              value={selectedWorkout}
              onChange={(e) => setSelectedWorkout(e.target.value)}
            />
          </div>
          
          <div>
            <Label>Date</Label>
            <Input
              type="date"
              value={selectedDate}
              onChange={(e) => setSelectedDate(e.target.value)}
            />
          </div>
        </div>
      </CardHeader>
      
      <CardContent>
        {!leaderboard || leaderboard.length === 0 ? (
          <div className="text-center py-8">
            <TrendingUp className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <p className="text-gray-500">No results found for the selected filters.</p>
            <p className="text-sm text-gray-400">Try adjusting your workout or date selection.</p>
          </div>
        ) : (
          <div className="space-y-4">
            {leaderboard.map((entry: LeaderboardEntry) => (
              <div
                key={`${entry.user.id}-${entry.date}`}
                className={`flex items-center p-4 rounded-lg border ${
                  entry.rank <= 3 ? "bg-gradient-to-r from-gray-50 to-gray-100" : "bg-white"
                }`}
              >
                {/* Rank */}
                <div className="flex items-center justify-center w-12 h-12 mr-4">
                  {entry.rank <= 3 ? (
                    <div className={`w-8 h-8 rounded-full ${getRankBadgeColor(entry.rank)} flex items-center justify-center`}>
                      {getRankIcon(entry.rank)}
                    </div>
                  ) : (
                    <div className="w-8 h-8 rounded-full bg-gray-200 flex items-center justify-center">
                      <span className="text-sm font-bold text-gray-600">{entry.rank}</span>
                    </div>
                  )}
                </div>

                {/* User Info */}
                <div className="flex items-center flex-1">
                  <Avatar className="h-10 w-10 mr-3">
                    <AvatarImage src={entry.user.profileImageUrl} />
                    <AvatarFallback>
                      {entry.user.firstName?.[0]}{entry.user.lastName?.[0]}
                    </AvatarFallback>
                  </Avatar>
                  
                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      <span className="font-semibold">
                        {entry.user.firstName} {entry.user.lastName}
                      </span>
                      <Badge variant={entry.scaleType === "rx" ? "default" : "secondary"}>
                        {entry.scaleType.toUpperCase()}
                      </Badge>
                    </div>
                    
                    <div className="flex items-center gap-2 text-sm text-gray-500">
                      <span>{entry.workout.name}</span>
                      <span>•</span>
                      <span>{format(new Date(entry.date), "MMM d, yyyy")}</span>
                    </div>
                  </div>
                </div>

                {/* Score */}
                <div className="text-right">
                  <div className="font-bold text-lg">{formatScore(entry)}</div>
                  <div className="flex items-center text-sm text-gray-500">
                    {entry.workout.type === "for_time" || entry.workout.type === "chipper" ? (
                      <Clock className="h-3 w-3 mr-1" />
                    ) : (
                      <Target className="h-3 w-3 mr-1" />
                    )}
                    <span>{entry.workout.type.replace("_", " ")}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
