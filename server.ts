import app from "./index";
import { config } from "dotenv";

// Cargar variables de entorno
config();

// Configuración del puerto
const PORT = process.env.PORT || 3001;

// Iniciar servidor
const server = app.listen(PORT, () => {
  console.log(`Servidor corriendo en http://localhost:${PORT}`);
});

// Manejo de errores de inicio del servidor
server.on("error", (error: NodeJS.ErrnoException) => {
  if (error.syscall !== "listen") throw error;

  switch (error.code) {
    case "EACCES":
      console.error(`El puerto ${PORT} requiere privilegios elevados`);
      process.exit(1);
      break;
    case "EADDRINUSE":
      console.error(`El puerto ${PORT} ya está en uso`);
      process.exit(1);
      break;
    default:
      throw error;
  }
});

// Manejo de señales de terminación
process.on("SIGINT", () => {
  console.log("\nApagando servidor...");
  server.close(() => {
    console.log("Servidor apagado correctamente");
    process.exit(0);
  });
});
