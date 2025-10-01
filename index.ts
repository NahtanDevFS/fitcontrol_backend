import express, { Express } from "express";
import cors from "cors";
import grupoMuscularRoutes from "./routes/grupo_muscular.route";
import musculoRoutes from "./routes/musculo.route";
import ejercicioRoutes from "./routes/ejercicio.route";
import ejercicioMusculoRoutes from "./routes/ejercicio_musculo.route";
import usuarioRoutes from "./routes/usuario.route";
import rutinaRoutes from "./routes/rutina.route";
import progresoUsuarioRoutes from "./routes/progreso_usuario.route";
import cumplimientoRutinaRoutes from "./routes/cumplimiento_rutina.route";
import dietaRoutes from "./routes/dieta.route";
import dietaAlimentoDetalleRoutes from "./routes/dieta_alimento_detalle.route";
import cumplimientoDietaRoutes from "./routes/cumplimiento_dieta.route";
import authRoutes from "./routes/auth.route";
import gastoEnergeticoRoutes from "./routes/gasto_energetico.route";
import perfilRoutes from "./routes/perfil.route";
import dashboardRoutes from "./routes/dashboard.route";
import cumplimientoDietaDiaRoutes from "./routes/cumplimiento_dieta_dia.route";
import trackerRoutes from "./routes/tracker.route";

const app: Express = express();
//Configuración de CORS
app.use(
  cors({
    origin: ["http://localhost:3000", "https://fitcontrol-frontend.vercel.app"], //Permite solo mi frontend en local y producción
    credentials: true, //cookies o autenticación basada en sesión
  })
);
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

//Ruta de prueba
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
app.use("/api/progreso-usuario", progresoUsuarioRoutes);
app.use("/api/cumplimiento-rutina", cumplimientoRutinaRoutes);
app.use("/api/dieta", dietaRoutes);
app.use("/api/dieta-alimento-detalle", dietaAlimentoDetalleRoutes);
app.use("/api/cumplimiento-dieta", cumplimientoDietaRoutes);
app.use("/api/auth", authRoutes);
app.use("/api/gasto-energetico", gastoEnergeticoRoutes);
app.use("/api/perfil", perfilRoutes);
app.use("/api/dashboard", dashboardRoutes);
app.use("/api/cumplimiento-dieta-dia", cumplimientoDietaDiaRoutes);
app.use("/api/tracker", trackerRoutes);

export default app;
