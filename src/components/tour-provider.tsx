"use client";

import React, { createContext, useContext, useState, useEffect } from "react";
import { X, ChevronLeft, ChevronRight, HelpCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";

interface TourStep {
  id: string;
  title: string;
  description: string;
  target: string;
  position: "top" | "bottom" | "left" | "right";
  action?: () => void;
}

interface TourContextType {
  isActive: boolean;
  currentStep: number;
  steps: TourStep[];
  startTour: () => void;
  endTour: () => void;
  nextStep: () => void;
  prevStep: () => void;
  goToStep: (step: number) => void;
}

const TourContext = createContext<TourContextType | null>(null);

export const useTour = () => {
  const context = useContext(TourContext);
  if (!context) {
    throw new Error("useTour must be used within TourProvider");
  }
  return context;
};

const tourSteps: TourStep[] = [
  {
    id: "welcome",
    title: "¡Bienvenido al Editor de Flutter!",
    description:
      "Este tour te guiará por todas las funcionalidades de la aplicación. Podrás diseñar interfaces móviles de forma visual y generar código Flutter automáticamente.",
    target: "body",
    position: "bottom",
  },
  {
    id: "sidebar",
    title: "Panel de Componentes",
    description:
      "Aquí encontrarás todos los widgets de Flutter disponibles. Simplemente arrastra y suelta los elementos que necesites en el canvas de diseño.",
    target: '[data-tour="sidebar"]',
    position: "right",
  },
  {
    id: "phone-preview",
    title: "Vista Previa del Diseño",
    description:
      "Esta es tu área de trabajo principal donde puedes ver cómo se verá tu aplicación en tiempo real. Puedes arrastrar componentes aquí y organizarlos visualmente.",
    target: '[data-tour="phone-preview"]',
    position: "left",
  },
  {
    id: "property-panel",
    title: "Panel de Propiedades",
    description:
      "Cuando selecciones un elemento, aquí podrás modificar sus propiedades como colores, tamaños, texto y más configuraciones específicas del widget.",
    target: '[data-tour="property-panel"]',
    position: "left",
  },
  {
    id: "undo-redo",
    title: "Controles de Historial",
    description: "Usa estos botones para deshacer o rehacer cambios en tu diseño. Nunca pierdas tu progreso.",
    target: '[data-tour="undo-redo"]',
    position: "bottom",
  },
  {
    id: "page-selector",
    title: "Selector de Páginas",
    description:
      "Crea y navega entre diferentes páginas de tu aplicación. Puedes tener múltiples pantallas en un solo proyecto.",
    target: '[data-tour="page-selector"]',
    position: "bottom",
  },
  {
    id: "save-load",
    title: "Guardar y Cargar",
    description:
      "Guarda tu progreso en un archivo JSON o carga diseños previamente guardados. Perfecto para trabajar en múltiples proyectos.",
    target: '[data-tour="save-load"]',
    position: "bottom",
  },
  {
    id: "code-viewer",
    title: "Visualizador de Código",
    description:
      "Haz clic aquí para ver el código Flutter generado automáticamente basado en tu diseño visual. Podrás copiarlo y usarlo directamente en tu proyecto.",
    target: '[data-tour="code-viewer"]',
    position: "bottom",
  },
  {
    id: "chat-panel",
    title: "Panel de Chat IA",
    description:
      "Utiliza la inteligencia artificial para obtener ayuda con tu diseño, hacer preguntas sobre Flutter o recibir sugerencias de mejora.",
    target: '[data-tour="chat-panel"]',
    position: "bottom",
  },
];

interface TourProviderProps {
  children: React.ReactNode;
}

export function TourProvider({ children }: TourProviderProps) {
  const [isActive, setIsActive] = useState(false);
  const [currentStep, setCurrentStep] = useState(0);
  const [highlightedElement, setHighlightedElement] = useState<Element | null>(null);

  const startTour = () => {
    console.log("Iniciando tour...");
    setIsActive(true);
    setCurrentStep(0);
  };

  const endTour = () => {
    console.log("Finalizando tour...");
    setIsActive(false);
    setCurrentStep(0);
    setHighlightedElement(null);
    document.body.style.overflow = "";
    // Limpiar todas las clases de highlight
    const allHighlighted = document.querySelectorAll(".tour-highlight-element");
    allHighlighted.forEach((el) => {
      el.classList.remove("tour-highlight-element");
      (el as HTMLElement).style.removeProperty("position");
      (el as HTMLElement).style.removeProperty("z-index");
    });
  };

  const nextStep = () => {
    if (currentStep < tourSteps.length - 1) {
      setCurrentStep(currentStep + 1);
    } else {
      endTour();
    }
  };

  const prevStep = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
    }
  };

  const goToStep = (step: number) => {
    if (step >= 0 && step < tourSteps.length) {
      setCurrentStep(step);
    }
  };

  useEffect(() => {
    console.log(`Tour estado: ${isActive}, Paso actual: ${currentStep}`);

    if (isActive) {
      document.body.style.overflow = "hidden";
      const currentStepData = tourSteps[currentStep];
      console.log(`Buscando elemento: ${currentStepData.target}`);

      if (currentStepData.action) {
        currentStepData.action();
      }

      const allHighlighted = document.querySelectorAll(".tour-highlight-element");
      allHighlighted.forEach((el) => {
        el.classList.remove("tour-highlight-element");
        (el as HTMLElement).style.removeProperty("position");
        (el as HTMLElement).style.removeProperty("z-index");
      });

      setTimeout(() => {
        const targetElement = document.querySelector(currentStepData.target);
        console.log(`Elemento encontrado:`, targetElement);

        if (targetElement) {
          setHighlightedElement(targetElement);

          targetElement.classList.add("tour-highlight-element");
          const htmlElement = targetElement as HTMLElement;

          const originalZIndex = htmlElement.style.zIndex;
          const originalPosition = htmlElement.style.position;

          if (!originalPosition || originalPosition === "static") {
            htmlElement.style.position = "relative";
          }
          htmlElement.style.zIndex = "60";

          targetElement.scrollIntoView({
            behavior: "smooth",
            block: "center",
            inline: "center",
          });

          if (targetElement instanceof HTMLElement) {
            targetElement.focus({ preventScroll: true });
          }
        } else {
          console.warn(`Tour target not found: ${currentStepData.target}`);

          const fallbackSelectors = [".main-container", "main", "body"];

          for (const selector of fallbackSelectors) {
            const fallbackElement = document.querySelector(selector);
            if (fallbackElement) {
              console.log(`Usando elemento fallback: ${selector}`);
              setHighlightedElement(fallbackElement);
              break;
            }
          }
        }
      }, 200);
    }

    return () => {
      if (!isActive) {
        document.body.style.overflow = "";

        const allHighlighted = document.querySelectorAll(".tour-highlight-element");
        allHighlighted.forEach((el) => {
          el.classList.remove("tour-highlight-element");
          (el as HTMLElement).style.removeProperty("position");
          (el as HTMLElement).style.removeProperty("z-index");
        });
      }
    };
  }, [isActive, currentStep]);

  const value: TourContextType = {
    isActive,
    currentStep,
    steps: tourSteps,
    startTour,
    endTour,
    nextStep,
    prevStep,
    goToStep,
  };

  return (
    <TourContext.Provider value={value}>
      {children}
      {isActive && <TourOverlay />}

      <style jsx global>{`
        .tour-highlight-element {
          box-shadow: 0 0 0 3px #3b82f6, 0 0 0 6px rgba(59, 130, 246, 0.3), 0 0 15px rgba(59, 130, 246, 0.5) !important;
          border-radius: 6px !important;
          transition: all 0.2s ease-in-out !important;
        }
      `}</style>
    </TourContext.Provider>
  );
}

function TourOverlay() {
  const { currentStep, steps, endTour, nextStep, prevStep, goToStep } = useTour();
  const currentStepData = steps[currentStep];
  const [tooltipPosition, setTooltipPosition] = useState({ top: 0, left: 0 });

  useEffect(() => {
    const updateTooltipPosition = () => {
      const targetElement = document.querySelector(currentStepData.target);
      if (targetElement) {
        const rect = targetElement.getBoundingClientRect();
        const tooltipWidth = 400;
        const tooltipHeight = 300;

        let top = 0;
        let left = 0;

        switch (currentStepData.position) {
          case "top":
            top = rect.top - tooltipHeight - 20;
            left = rect.left + rect.width / 2 - tooltipWidth / 2;
            break;
          case "bottom":
            top = rect.bottom + 20;
            left = rect.left + rect.width / 2 - tooltipWidth / 2;
            break;
          case "left":
            top = rect.top + rect.height / 2 - tooltipHeight / 2;
            left = rect.left - tooltipWidth - 20;
            break;
          case "right":
            top = rect.top + rect.height / 2 - tooltipHeight / 2;
            left = rect.right + 20;
            break;
        }

        top = Math.max(10, Math.min(top, window.innerHeight - tooltipHeight - 10));
        left = Math.max(10, Math.min(left, window.innerWidth - tooltipWidth - 10));

        setTooltipPosition({ top, left });
      }
    };

    updateTooltipPosition();
    window.addEventListener("resize", updateTooltipPosition);

    return () => window.removeEventListener("resize", updateTooltipPosition);
  }, [currentStep, currentStepData]);

  return (
    <>
      {/* Overlay */}
      <div className="fixed inset-0 bg-black/70 z-40" />

      {/* Spotlight */}
      <div className="fixed inset-0 z-45 pointer-events-none">
        <TourSpotlight target={currentStepData.target} />
      </div>

      {/* Tooltip */}
      <Card
        className="fixed z-[9999] w-[400px] shadow-2xl border-2 bg-background border-primary/20 pointer-events-auto"
        style={{
          top: tooltipPosition.top,
          left: tooltipPosition.left,
        }}
      >
        <CardContent className="p-6">
          <div className="flex justify-between items-start mb-4">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 bg-primary rounded-full flex items-center justify-center text-primary-foreground text-sm font-bold">
                {currentStep + 1}
              </div>
              <h3 className="text-lg font-semibold text-foreground">{currentStepData.title}</h3>
            </div>
            <Button variant="ghost" size="sm" onClick={endTour} className="p-1 h-auto">
              <X className="w-4 h-4" />
            </Button>
          </div>

          <p className="text-sm text-muted-foreground mb-4 leading-relaxed">{currentStepData.description}</p>

          {/* Indicadores de paso */}
          <div className="flex justify-center gap-1 mb-4">
            {steps.map((_, index) => (
              <button
                key={index}
                onClick={() => goToStep(index)}
                className={`w-2 h-2 rounded-full transition-all duration-200 ${
                  index === currentStep ? "bg-primary w-6" : index < currentStep ? "bg-primary/60" : "bg-muted"
                }`}
              />
            ))}
          </div>

          <div className="flex justify-between items-center mb-4">
            <div className="text-xs text-muted-foreground">
              Paso {currentStep + 1} de {steps.length}
            </div>

            <div className="flex gap-2">
              <Button variant="outline" size="sm" onClick={prevStep} disabled={currentStep === 0}>
                <ChevronLeft className="w-4 h-4 mr-1" />
                Anterior
              </Button>

              <Button size="sm" onClick={nextStep} className="bg-primary hover:bg-primary/90">
                {currentStep === steps.length - 1 ? "Finalizar" : "Siguiente"}
                {currentStep !== steps.length - 1 && <ChevronRight className="w-4 h-4 ml-1" />}
              </Button>
            </div>
          </div>

          {/* Botón de saltar */}
          <div className="text-center">
            <Button
              variant="ghost"
              size="sm"
              onClick={endTour}
              className="text-xs text-muted-foreground hover:text-foreground"
            >
              Saltar tour
            </Button>
          </div>
        </CardContent>
      </Card>
    </>
  );
}

function TourSpotlight({ target }: { target: string }) {
  const [spotlightStyle, setSpotlightStyle] = useState({});

  useEffect(() => {
    const targetElement = document.querySelector(target);
    if (targetElement) {
      const rect = targetElement.getBoundingClientRect();
      const padding = 10;

      setSpotlightStyle({
        clipPath: `polygon(
          0% 0%, 
          0% 100%, 
          ${rect.left - padding}px 100%, 
          ${rect.left - padding}px ${rect.top - padding}px, 
          ${rect.right + padding}px ${rect.top - padding}px, 
          ${rect.right + padding}px ${rect.bottom + padding}px, 
          ${rect.left - padding}px ${rect.bottom + padding}px, 
          ${rect.left - padding}px 100%, 
          100% 100%, 
          100% 0%
        )`,
      });
    }
  }, [target]);

  return <div className="absolute inset-0 bg-black/50 transition-all duration-300" style={spotlightStyle} />;
}

// components/tour/tour-button.tsx
export function TourButton() {
  const { startTour, isActive } = useTour();

  const handleStartTour = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    console.log("Botón Manual de Usuario clickeado");
    if (!isActive) {
      startTour();
    }
  };

  return (
    <Button variant="outline" size="sm" onClick={handleStartTour} className="gap-2" disabled={isActive}>
      <HelpCircle className="w-4 h-4" />
      Manual de Usuario
    </Button>
  );
}
