import express, { Application } from "express";
import cors from "cors";
import grupoMuscularRoutes from "./routes/grupo_muscular.route";
import musculoRoutes from "./routes/musculo.route";
import ejercicioRoutes from "./routes/ejercicio.route";
import ejercicioMusculoRoutes from "./routes/ejercicio_musculo.route";
import usuarioRoutes from "./routes/usuario.route";
import rutinaRoutes from "./routes/rutina.route";
import rutinaDiaRoutes from "./routes/rutina_dia_semana.route";
import rutinaDiaEjercicioRoutes from "./routes/rutina_dia_semana_ejercicio.route";
import progresoUsuarioRoutes from "./routes/progreso_usuario.route";

const app: Application = express();

// Middlewares
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Ruta de prueba
app.get("/", (req, res) => {
  res.send("API funcionando");
});

//rutas
app.use("/api/grupo-muscular", grupoMuscularRoutes);
app.use("/api/musculo", musculoRoutes);
app.use("/api/ejercicio", ejercicioRoutes);
app.use("/api/ejercicio-musculo", ejercicioMusculoRoutes);
app.use("/api/usuario", usuarioRoutes);
app.use("/api/rutina", rutinaRoutes);
app.use("/api/rutina-dia", rutinaDiaRoutes);
app.use("/api/rutina-dia-ejercicio", rutinaDiaEjercicioRoutes);
app.use("/api/progreso-usuario", progresoUsuarioRoutes);

export default app;
