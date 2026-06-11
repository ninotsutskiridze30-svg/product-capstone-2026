"use client";

import { useRouter } from "@/shared/i18n/navigation";

import { useState, useSyncExternalStore } from "react";
import { toast } from "sonner";

import { useToggleTutorFavorite } from "@/entities/favorite/api/favorite.query";
import { useCurrentUser } from "@/entities/user/api/user.query";
import { Button } from "@/shared/ui/button";
import { Heart } from "lucide-react";

const emptySubscribe = () => () => {};

type Props = {
  tutorId: string;
  initialFavorited: boolean;
};

export function FavoriteTutorButton({ tutorId, initialFavorited }: Props) {
  const router = useRouter();
  const mounted = useSyncExternalStore(emptySubscribe, () => true, () => false);
  const [fav, setFav] = useState(initialFavorited);
  const { data: userRes } = useCurrentUser();
  const toggleFavorite = useToggleTutorFavorite();

  if (!mounted) {
    return null;
  }

  if (userRes?.user?.role !== "student") {
    return null;
  }

  async function toggle() {
    try {
      const res = await toggleFavorite.mutateAsync(tutorId);
      setFav(res.favorited);
      toast.success(res.favorited ? "Saved to favorites" : "Removed");
      router.refresh();
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Something went wrong");
    }
  }

  return (
    <Button
      type="button"
      variant={fav ? "secondary" : "outline"}
      size="sm"
      className="gap-1"
      disabled={toggleFavorite.isPending}
      onClick={() => void toggle()}
    >
      <Heart className={fav ? "fill-current" : ""} size={16} />
      {fav ? "Favorited" : "Favorite"}
    </Button>
  );
}
