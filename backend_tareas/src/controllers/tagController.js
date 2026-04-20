import db from '../../models/index.cjs';
const { Tag, Tarea, Persona } = db;

export const obtenerTodos = async (req, res) => {
  try {
    const tags = await Tag.findAll();
    res.json({ success: true, data: tags });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

// Todas las Personas relacionadas con un Tag
export const obtenerPersonasPorTag = async (req, res) => {
  try {
    const { id } = req.params;
    const tagConTodo = await Tag.findByPk(id, {
      include: {
        model: Tarea,
        as: 'tareas',
        include: {
          model: Persona,
          as: 'autor'
        }
      }
    });

    if (!tagConTodo) return res.status(404).json({ success: false, message: 'Tag no encontrado' });

    // Obtenemos los autores únicos que tienen tareas con este tag
    const personas = [...new Set(tagConTodo.tareas.map(t => t.autor))];

    res.json({ success: true, data: personas });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};