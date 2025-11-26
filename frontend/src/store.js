import { create } from 'zustand';
import { persist } from 'zustand/middleware';

// Cargar estadísticas iniciales desde localStorage
const initialStats = JSON.parse(localStorage.getItem('ruleta-estadisticas')) || {
  totalRespondidas: 0,
  totalCorrectas: 0,
  totalIncorrectas: 0,
};

const useStore = create(
  persist(
    (set, get) => ({
      preguntasActivas: [],
      preguntaActual: null,
      estadisticas: initialStats,
      setPreguntasActivas: (ids) => set({ preguntasActivas: ids }),
      setPreguntaActual: (pregunta) => set({ preguntaActual: pregunta }),
      responderPregunta: (correcto) => set((state) => {
        const newStats = {
          totalRespondidas: state.estadisticas.totalRespondidas + 1,
          totalCorrectas: correcto ? state.estadisticas.totalCorrectas + 1 : state.estadisticas.totalCorrectas,
          totalIncorrectas: correcto ? state.estadisticas.totalIncorrectas : state.estadisticas.totalIncorrectas + 1,
        };
        // Guardar en localStorage
        localStorage.setItem('ruleta-estadisticas', JSON.stringify(newStats));
        return {
          estadisticas: newStats,
          preguntaActual: null,
        };
      }),
      resetEstadisticas: () => {
        const resetStats = {
          totalRespondidas: 0,
          totalCorrectas: 0,
          totalIncorrectas: 0,
        };
        localStorage.setItem('ruleta-estadisticas', JSON.stringify(resetStats));
        set({ estadisticas: resetStats });
      },
    }),
    {
      name: 'ruleta-storage', // nombre para localStorage
      partialize: (state) => ({ estadisticas: state.estadisticas }), // solo persistir estadísticas
    }
  )
);

export default useStore;