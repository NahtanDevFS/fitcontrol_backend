import { Request, Response } from "express";
import { supabase } from "../libs/supabaseClient";

//Obtener alimentos de una dieta filtrando por id_dieta
// export const getAlimentoDieta = async (req: Request, res: Response) => {
//   try {
//     const { id } = req.params;
//     const { data, error } = await supabase
//       .from("dieta_alimento")
//       .select("*")
//       .eq("id_dieta", id)
//       .order("dia_semana", { ascending: true })
//       .order("hora", { ascending: true });

//     if (error) {
//       return res.status(500).json({ error: error.message });
//     }

//     res.json(data);
//   } catch (error) {
//     console.error("Error al obtener los alimentos de la dieta:", error);
//     res.status(500).json({ error: "Error interno del servidor" });
//   }
// };

//Obtener un alimento de dieta específico por su ID
// export const getDietaAlimentoById = async (req: Request, res: Response) => {
//   try {
//     const { id } = req.params;
//     const { data, error } = await supabase
//       .from("dieta_alimento")
//       .select("*")
//       .eq("id_dieta_alimento", id)
//       .single();

//     if (error) {
//       return res.status(500).json({ error: error.message });
//     }

//     if (!data) {
//       return res
//         .status(404)
//         .json({ error: "Registro de dieta-alimento no encontrado" });
//     }

//     res.json(data);
//   } catch (error) {
//     console.error("Error al obtener el alimento de la dieta:", error);
//     res.status(500).json({ error: "Error interno del servidor" });
//   }
// };

//Crear un nuevo registro de alimento en dieta
// export const crearDietaAlimento = async (req: Request, res: Response) => {
//   try {
//     const { id_dieta, tiempo_comida, dia_semana, hora } = req.body;

//     //Validación básica
//     if (!id_dieta || !tiempo_comida || !dia_semana || !hora) {
//       return res.status(400).json({
//         error:
//           "Todos los campos son obligatorios (id_dieta, tiempo_comida, dia_semana, hora)",
//       });
//     }

//     //Validar formato de hora
//     if (!/^([01]\d|2[0-3]):([0-5]\d)$/.test(hora)) {
//       return res
//         .status(400)
//         .json({ error: "Formato de hora inválido. Use HH:MM" });
//     }

//     const { data, error } = await supabase
//       .from("dieta_alimento")
//       .insert([
//         {
//           id_dieta,
//           tiempo_comida,
//           dia_semana,
//           hora,
//         },
//       ])
//       .select()
//       .single();

//     if (error) {
//       return res.status(400).json({ error: error.message });
//     }

//     res.status(201).json(data);
//   } catch (error) {
//     console.error("Error al crear registro de dieta-alimento:", error);
//     res.status(500).json({ error: "Error interno del servidor" });
//   }
// };

//Actualizar un registro de alimento en dieta
// export const actualizarDietaAlimento = async (req: Request, res: Response) => {
//   try {
//     const id_dieta_alimento = req.params.id;
//     const { tiempo_comida, dia_semana, hora } = req.body;

//     //Validar que el registro existe
//     const { data: dietaAlimentoExistente, error: errorExistente } =
//       await supabase
//         .from("dieta_alimento")
//         .select("id_dieta_alimento")
//         .eq("id_dieta_alimento", id_dieta_alimento)
//         .single();

//     if (errorExistente || !dietaAlimentoExistente) {
//       return res
//         .status(404)
//         .json({ error: "Registro de dieta-alimento no encontrado" });
//     }

//     //Campos a actualizar
//     const updates: Record<string, any> = {};
//     if (tiempo_comida) updates.tiempo_comida = tiempo_comida;
//     if (dia_semana) updates.dia_semana = dia_semana;
//     if (hora) {
//       if (!/^([01]\d|2[0-3]):([0-5]\d)$/.test(hora)) {
//         return res
//           .status(400)
//           .json({ error: "Formato de hora inválido. Use HH:MM" });
//       }
//       updates.hora = hora;
//     }

//     //Si no hay campos válidos para actualizar
//     if (Object.keys(updates).length === 0) {
//       return res
//         .status(400)
//         .json({ error: "No se proporcionaron campos válidos para actualizar" });
//     }

//     const { data, error } = await supabase
//       .from("dieta_alimento")
//       .update(updates)
//       .eq("id_dieta_alimento", id_dieta_alimento)
//       .select();

//     if (error) {
//       return res.status(400).json({ error: error.message });
//     }

//     res.json(data[0]);
//   } catch (error) {
//     console.error("Error al actualizar alimento de la dieta:", error);
//     res.status(500).json({ error: "Error interno del servidor" });
//   }
// };

//Eliminar un alimento de dieta
// export const eliminarDietaAlimento = async (req: Request, res: Response) => {
//   try {
//     const { id } = req.params;

//     //Verificar existencia
//     const { error: verifyError } = await supabase
//       .from("dieta_alimento")
//       .select("id_dieta_alimento")
//       .eq("id_dieta_alimento", id)
//       .single();

//     if (verifyError) {
//       return res
//         .status(404)
//         .json({ error: "Registro de dieta-alimento no encontrado" });
//     }

//     //Eliminación
//     const { error } = await supabase
//       .from("dieta_alimento")
//       .delete()
//       .eq("id_dieta_alimento", id);

//     if (error) {
//       return res.status(400).json({
//         error: "Error al eliminar",
//         detalles: error.message,
//       });
//     }

//     res.status(204).send(); //204 No Content
//   } catch (error) {
//     console.error("Error al eliminar el alimento de la dieta:", error);
//     res.status(500).json({ error: "Error interno del servidor" });
//   }
// };

//Obtener alimentos de dieta por día y tiempo de comida
// export const getAlimentosDietaPorDiaYTiempo = async (
//   req: Request,
//   res: Response
// ) => {
//   try {
//     const { id_dieta, dia_semana, tiempo_comida } = req.params;

//     const { data, error } = await supabase
//       .from("dieta_alimento")
//       .select("*")
//       .eq("id_dieta", id_dieta)
//       .eq("dia_semana", dia_semana)
//       .eq("tiempo_comida", tiempo_comida)
//       .order("hora", { ascending: true });

//     if (error) {
//       return res.status(500).json({ error: error.message });
//     }

//     res.json(data);
//   } catch (error) {
//     console.error("Error al obtener alimentos por día y tiempo:", error);
//     res.status(500).json({ error: "Error interno del servidor" });
//   }
// };
