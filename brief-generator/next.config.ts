import type { NextConfig } from 'next';

const nextConfig: NextConfig = {
  // @react-pdf/renderer y sus dependencias sólo corren en Node, nunca en el bundle del cliente.
  serverExternalPackages: ['@react-pdf/renderer'],
  // El repositorio tiene otro proyecto en la raíz; sin esto Next toma el
  // lockfile de más arriba como raíz del workspace y traza archivos de más.
  outputFileTracingRoot: process.cwd(),
};

export default nextConfig;
