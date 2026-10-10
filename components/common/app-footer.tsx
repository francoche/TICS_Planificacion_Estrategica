import React from 'react';
import Image from 'next/image';
import { MapPin } from 'lucide-react';

export function AppFooter() {
  return (
    <footer className="w-full border-t border-border/50 bg-gradient-to-r from-background/95 via-cyan-500/[0.04] to-background/95 backdrop-blur-md text-muted-foreground transition-colors">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3.5">
        <div className="flex flex-col sm:flex-row items-center justify-between gap-3 text-xs">
          {/* Logo UADER e Institución */}
          <div className="flex items-center gap-3">
            <div className="relative h-7 w-28 shrink-0 flex items-center">
              {/* Versión con texto oscuro para fondo claro */}
              <Image
                src="/uader-dark.png"
                alt="Logo UADER - Facultad de Ciencia y Tecnología"
                width={130}
                height={37}
                className="h-7 w-auto object-contain dark:hidden opacity-90 hover:opacity-100 transition-opacity"
                priority
              />
              {/* Versión con texto blanco para modo oscuro */}
              <Image
                src="/uader.png"
                alt="Logo UADER - Facultad de Ciencia y Tecnología"
                width={130}
                height={37}
                className="h-7 w-auto object-contain hidden dark:block opacity-90 hover:opacity-100 transition-opacity"
                priority
              />
            </div>
            <div className="h-4 w-px bg-border/70 hidden sm:block" />
            <div className="flex flex-col sm:flex-row sm:items-center gap-1 sm:gap-2">
              <span className="font-medium text-foreground">
                Facultad de Ciencia y Tecnología - Lic. en Sistemas de Información
              </span>
              <span className="hidden sm:inline text-muted-foreground/60">•</span>
              <span className="text-muted-foreground">
                © 2026. Todos los derechos reservados
              </span>
            </div>
          </div>

          {/* Ubicación / Dirección */}
          <div className="flex items-center gap-1.5 text-muted-foreground">
            <MapPin className="size-3.5 text-primary shrink-0" />
            <span className="tracking-tight">Ruta Provincial Nº 11. Km 10,5</span>
          </div>
        </div>
      </div>
    </footer>
  );
}
