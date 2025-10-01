import { Request, Response } from "express";
import { supabase } from "../libs/supabaseClient";

//Mapa para convertir el número del día de la semana en su nombre
const diasSemanaMapa: { [key: number]: string } = {
  0: "Domingo",
  1: "Lunes",
  2: "Martes",
  3: "Miércoles",
  4: "Jueves",
  5: "Viernes",
  6: "Sábado",
};

export const getProfileData = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;

    //Obtener datos básicos y progreso
    const [userProfile, pesoData, rutinaActivaData, dietaActivaData] =
      await Promise.all([
        supabase
          .from("usuario")
          .select("nombre_usuario, correo_usuario, unidad_peso")
          .eq("id_usuario", id)
          .single(),
        supabase
          .from("progreso_usuario")
          .select("peso_actual")
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
      ]);

    if (userProfile.error) throw userProfile.error;

    //Calcular Racha de Rutina
    let rachaRutina = 0;
    const diasDeRutina = rutinaActivaData.data?.dias || [];
    if (rutinaActivaData.data && diasDeRutina.length > 0) {
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

          if (cumplimientosMap.get(fechaHoyStr) === true) rachaRutina++;

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
    const diasDeDieta = dietaActivaData.data?.dias || [];
    if (dietaActivaData.data && diasDeDieta.length > 0) {
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

          if (cumplimientosMap.get(fechaHoyStr) === true) rachaDieta++;
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

    //Ensamblar la respuesta
    const profileData = {
      nombre_usuario: userProfile.data.nombre_usuario,
      correo_usuario: userProfile.data.correo_usuario,
      unidad_peso: userProfile.data.unidad_peso || "kg",
      peso_actual: pesoData.data?.peso_actual || null,
      racha_rutina: rachaRutina,
      racha_dieta: rachaDieta,
    };

    res.status(200).json(profileData);
  } catch (error: any) {
    console.error("Error al obtener los datos del perfil:", error);
    res
      .status(500)
      .json({ error: "Error interno del servidor", details: error.message });
  }
};
