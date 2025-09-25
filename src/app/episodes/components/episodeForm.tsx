'use client';

import { useForm } from 'react-hook-form';
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Episode } from '@/app/episodes/interface';

type FormData = {
  title: string;
  characters: string;
};

interface CreateEpisodeFormProps {
  onAddEpisode: (newEpisode: Episode) => void;
}

export default function CreateEpisodeForm({ onAddEpisode }: CreateEpisodeFormProps) {
  const { register, handleSubmit, formState: { errors, isValid }, reset } = useForm<FormData>({
    mode: 'onChange',
  });

  const onSubmit = (data: FormData) => {
    const newEpisode: Episode = {
      id: Date.now(),
      name: data.title,
      air_date: new Date().toISOString().split('T')[0],
      episode: 'S00E00',
      character: data.characters.split('-').map(id => ({
        id: parseInt(id),
        name: `Personaje ${id}`,
        image: 'https://rickandmortyapi.com/api/character/avatar/19.jpeg',
      })),
    };

    onAddEpisode(newEpisode);
    toast.success(`Episodio "${data.title}" creado correctamente.`);
    reset();
  };

  return (
    <div className="border rounded-lg h-full p-4 flex flex-col">
      <h3 className="text-lg font-semibold mb-4">Crear Recurso</h3>
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
        <div className="space-y-2">
          <Label htmlFor="title">Título</Label>
          <Input 
            id="title"
            placeholder="Título del episodio"
            {...register('title', { 
              required: "El título es requerido.",
              minLength: {
                value: 6,
                message: "El título debe tener al menos 6 caracteres."
              }
            })}
          />
          {errors.title && <p className="text-sm text-red-500">{errors.title.message}</p>}
        </div>
        
        <div className="space-y-2">
          <Label htmlFor="characters">IDs de Personajes</Label>
          <Input 
            id="characters"
            placeholder="Ej: 1-2-3-4-5"
            {...register('characters', {
              required: "Los IDs son requeridos.",
              pattern: {
                value: /^\d+-\d+-\d+-\d+$/,
                message: "Formato inválido. Usa un patrón como 10-2-35-12-15."
              }
            })}
          />
          {errors.characters && <p className="text-sm text-red-500">{errors.characters.message}</p>}
        </div>

        <Button type="submit" disabled={!isValid}>
          Agregar Episodio
        </Button>
      </form>
    </div>
  );
}