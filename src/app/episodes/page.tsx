'use client';

import { useState, useEffect } from 'react';
import { toast } from "sonner";
import Image from 'next/image';
import { Star } from 'lucide-react';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Episode, Character } from '@/app/episodes/interface';

export default function HomePage() {
  const [allEpisodes, setAllEpisodes] = useState<Episode[]>([]);
  const [favorites, setFavorites] = useState<Episode[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    try {
      const storedFavorites = localStorage.getItem('favorites');
      if (storedFavorites) {
        setFavorites(JSON.parse(storedFavorites));
      }
    } catch (error) {
      console.error("Error al leer de localStorage", error);
    }
  }, []);

  useEffect(() => {
    const fetchAllData = async () => {
      setIsLoading(true);
      try {
        const response = await fetch('https://rickandmortyapi.com/api/episode');
        const data = await response.json();
        const apiEpisodes = data.results;

        const episodesWithCharacters: Episode[] = await Promise.all(
          apiEpisodes.map(async (apiEpisode: any) => {
            const characterPromises = apiEpisode.characters
              .slice(0, 5)
              .map((url: string) => fetch(url).then((res) => res.json()));
            const characterDetails: Character[] = await Promise.all(characterPromises);
            return {
              id: apiEpisode.id,
              name: apiEpisode.name,
              air_date: apiEpisode.air_date,
              episode: apiEpisode.episode,
              character: characterDetails
            };
          })
        );
        setAllEpisodes(episodesWithCharacters);
      } catch (error) {
        console.error("Error al obtener datos de la API:", error);
        toast.error("No se pudieron cargar los episodios.");
      } finally {
        setIsLoading(false);
      }
    };

    fetchAllData();
  }, []);

  const handleToggleFavorite = (episode: Episode) => {
    let updatedFavorites: Episode[] = [];
    const isAlreadyFavorite = favorites.some(fav => fav.id === episode.id);

    if (isAlreadyFavorite) {
      updatedFavorites = favorites.filter(fav => fav.id !== episode.id);
      toast.error(`"${episode.name}" eliminado de favoritos.`);
    } else {
      updatedFavorites = [...favorites, episode];
      toast.success(`"${episode.name}" agregado a favoritos.`);
    }

    setFavorites(updatedFavorites);
    try {
      localStorage.setItem('favorites', JSON.stringify(updatedFavorites));
    } catch (error) {
      console.error("Error al guardar en localStorage", error);
    }
  };

  const isFavorite = (episodeId: number) => {
    return favorites.some(fav => fav.id === episodeId);
  };

  return (
    <main className="grid grid-cols-1 lg:grid-cols-3 gap-6 p-6 h-screen">
      
      <div className="lg:col-span-2 h-full overflow-y-auto pr-2">
        {isLoading ? (
          <p>Cargando episodios...</p>
        ) : (
          <div className="grid grid-cols-1 xl:grid-cols-2 gap-4">
            {allEpisodes.map((episode) => (
              <Card key={episode.id} className="flex flex-col">
                <CardHeader>
                  <div className="flex justify-between items-start">
                    <div>
                      <CardTitle>{episode.name}</CardTitle>
                      <CardDescription>{`Episodio: ${episode.episode}`}</CardDescription>
                    </div>
                    <Button variant="ghost" size="icon" onClick={() => handleToggleFavorite(episode)}>
                      <Star className="h-5 w-5" fill={isFavorite(episode.id) ? 'gold' : 'none'} color={isFavorite(episode.id) ? 'gold' : 'currentColor'}/>
                    </Button>
                  </div>
                </CardHeader>
                <CardContent className="flex-grow">
                  <p><strong>Fecha de emisión:</strong> {episode.air_date}</p>
                </CardContent>
                <CardFooter>
                  <div className="flex space-x-2">
                    {episode.character?.slice(0, 5).map((char) => (
                      <Image key={char.id} src={char.image} alt={char.name} width={30} height={30} className="rounded-full" title={char.name} />
                    ))}
                  </div>
                </CardFooter>
              </Card>
            ))}
          </div>
        )}
      </div>

      <div className="flex flex-col gap-6 h-full">
        <div className="h-1/2">
          <Card className="h-full">
            <CardHeader>
              <CardTitle>Favoritos</CardTitle>
            </CardHeader>
            <CardContent className="flex flex-col gap-4 overflow-y-auto h-[calc(100%-4rem)]">
              {favorites.length === 0 ? (
                <p className="text-sm text-muted-foreground">No has agregado episodios a favoritos.</p>
              ) : (
                favorites.map(fav => (
                  <div key={fav.id} className="flex items-center justify-between p-2 border rounded-md">
                    <span className="font-medium">{fav.name}</span>
                    <Button variant="ghost" size="icon" onClick={() => handleToggleFavorite(fav)}>
                      <Star className="h-5 w-5" fill="gold" color="gold" />
                    </Button>
                  </div>
                ))
              )}
            </CardContent>
          </Card>
        </div>
        <div className="h-1/2">
          <div className="border rounded-lg h-full flex items-center justify-center">
            <p>Panel para crear recurso</p>
          </div>
        </div>
      </div>
    </main>
  );
}