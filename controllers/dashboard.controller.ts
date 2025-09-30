//fitcontrol_backend/controllers/dashboard.controller.ts

import { Request, Response } from "express";
import { supabase } from "../libs/supabaseClient";

const diasSemanaMapa: { [key: number]: string } = {
  0: "Domingo",
  1: "Lunes",
  2: "Martes",
  3: "Miércoles",
  4: "Jueves",
  5: "Viernes",
  6: "Sábado",
};

export const getDashboardData = async (req: Request, res: Response) => {
  try {
    const { id } = req.params; //ID del usuario

    const [progresoData, rutinaActivaData, dietaActivaData, usuarioData] =
      await Promise.all([
        supabase
          .from("progreso_usuario")
          .select("peso_actual, peso_deseado")
          .eq("id_usuario", id)
          .eq("estado", 1)
          .maybeSingle(),
        supabase
          .from("rutina")
          .select(`id_rutina, dias:rutina_dia_semana(*)`)
          .eq("id_usuario", id)
          .eq("estado", 1)
          .limit(1)
          .single(),
        supabase
          .from("dieta")
          .select(
            `id_dieta, dias:dieta_alimento(*, alimentos:dieta_alimento_detalle(*))`
          )
          .eq("id_usuario", id)
          .limit(1)
          .single(),
        supabase
          .from("usuario")
          .select("nombre_usuario, unidad_peso")
          .eq("id_usuario", id)
          .single(),
      ]);

    if (usuarioData.error) throw usuarioData.error;

    //Calcular Racha de Rutina
    let rachaRutina = 0;
    if (rutinaActivaData.data && rutinaActivaData.data.dias) {
      const diasConRutina = new Set(
        rutinaActivaData.data.dias.map((d: any) => d.dia_semana)
      );
      const idsDiasConRutina = rutinaActivaData.data.dias
        .map((d: any) => d.id_rutina_dia_semana)
        .filter(Boolean);
      if (idsDiasConRutina.length > 0) {
        const { data: cumplimientos } = await supabase
          .from("cumplimiento_rutina")
          .select("*")
          .in("id_rutina_dia_semana", idsDiasConRutina);
        if (cumplimientos) {
          const cumplimientosMap = new Map(
            cumplimientos.map((c: any) => [c.fecha_a_cumplir, c.cumplido])
          );
          const hoy = new Date();
          const fechaHoyStr = `${hoy.getFullYear()}-${String(
            hoy.getMonth() + 1
          ).padStart(2, "0")}-${String(hoy.getDate()).padStart(2, "0")}`;
          if (cumplimientosMap.get(fechaHoyStr)) rachaRutina++;
          for (let i = 1; i < 90; i++) {
            const diaAnterior = new Date();
            diaAnterior.setDate(hoy.getDate() - i);
            const nombreDia = diasSemanaMapa[diaAnterior.getDay()];
            const fechaStr = `${diaAnterior.getFullYear()}-${String(
              diaAnterior.getMonth() + 1
            ).padStart(2, "0")}-${String(diaAnterior.getDate()).padStart(
              2,
              "0"
            )}`;
            if (diasConRutina.has(nombreDia)) {
              if (cumplimientosMap.get(fechaStr) === true) rachaRutina++;
              else break;
            }
          }
        }
      }
    }

    //Calcular Racha de Dieta
    let rachaDieta = 0;
    if (dietaActivaData.data && dietaActivaData.data.dias) {
      const diasConDieta = new Set<string>();
      dietaActivaData.data.dias.forEach((comida: any) => {
        if (comida.alimentos.length > 0) diasConDieta.add(comida.dia_semana);
      });
      if (diasConDieta.size > 0) {
        const { data: cumplimientosDieta } = await supabase
          .from("cumplimiento_dieta_dia")
          .select("*")
          .eq("id_dieta", dietaActivaData.data.id_dieta);
        if (cumplimientosDieta) {
          const cumplimientosMap = new Map(
            cumplimientosDieta.map((c: any) => [c.fecha_a_cumplir, c.cumplido])
          );
          const hoy = new Date();
          const fechaHoyStr = `${hoy.getFullYear()}-${String(
            hoy.getMonth() + 1
          ).padStart(2, "0")}-${String(hoy.getDate()).padStart(2, "0")}`;
          if (cumplimientosMap.get(fechaHoyStr)) rachaDieta++;
          for (let i = 1; i < 90; i++) {
            const diaAnterior = new Date();
            diaAnterior.setDate(hoy.getDate() - i);
            const nombreDia = diasSemanaMapa[diaAnterior.getDay()];
            const fechaStr = `${diaAnterior.getFullYear()}-${String(
              diaAnterior.getMonth() + 1
            ).padStart(2, "0")}-${String(diaAnterior.getDate()).padStart(
              2,
              "0"
            )}`;
            if (diasConDieta.has(nombreDia)) {
              if (cumplimientosMap.get(fechaStr) === true) rachaDieta++;
              else break;
            }
          }
        }
      }
    }

    //respuesta final
    const dashboardData = {
      nombreUsuario: usuarioData.data.nombre_usuario,
      rachaRutina,
      rachaDieta,
      pesoActual: progresoData.data?.peso_actual || null,
      metaPeso: progresoData.data?.peso_deseado || null,
      unidadPeso: usuarioData.data.unidad_peso || "kg",
    };

    res.status(200).json(dashboardData);
  } catch (error: any) {
    console.error("Error al obtener los datos del dashboard:", error);
    res
      .status(500)
      .json({ error: "Error interno del servidor", details: error.message });
  }
};
