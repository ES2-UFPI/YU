export type MascotEventType =
  | "metaCumprida"
  | "sugestaoIgnorada"
  | "streakQuebrada"
  | "streakRecuperada";

export type MascotEvent = {
  type: MascotEventType;
  id?: string;
  createdAt?: number;
};
