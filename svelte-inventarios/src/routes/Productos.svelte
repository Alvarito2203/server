<script>
    import { onMount } from "svelte";

    let productos = [];
    let nombre = "";
    let precio = "";
    let stock = "";
    let editId = null;

    // Obtener productos del backend
    const fetchProductos = async () => {
        const res = await fetch("http://localhost:3000/productos");
        productos = await res.json();
    };

    const agregarProducto = async () => {
    if (!nombre || precio < 0 || stock < 0) {
        alert("Por favor, ingrese valores válidos. El precio y el stock no pueden ser negativos.");
        return;
    }

    await fetch("http://localhost:3000/productos", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ nombre, precio, stock }),
    });

    fetchProductos(); // Actualiza la lista de productos
    limpiarFormulario();
};

const actualizarProducto = async () => {
    if (!nombre || precio < 0 || stock < 0) {
        alert("Por favor, ingrese valores válidos. El precio y el stock no pueden ser negativos.");
        return;
    }

    await fetch(`http://localhost:3000/productos/${editId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ nombre, precio, stock }),
    });

    fetchProductos(); // Actualiza la lista de productos
    limpiarFormulario();
};


    // Eliminar producto
    const eliminarProducto = async (id) => {
    if (confirm("¿Estás seguro de que deseas eliminar este producto?")) {
        const res = await fetch(`http://localhost:3000/productos/${id}`, {
            method: "DELETE",
        });

        if (res.ok) {
            alert("Producto eliminado correctamente.");
            fetchProductos(); // Actualiza la lista de productos
        } else {
            alert("Error al eliminar el producto. Asegúrate de que no esté relacionado con pedidos.");
        }
    }
};



    // Seleccionar producto para edición
    const seleccionarProducto = (producto) => {
        editId = producto.id;
        nombre = producto.nombre;
        precio = producto.precio;
        stock = producto.stock;
    };

    // Limpiar formulario
    const limpiarFormulario = () => {
        editId = null;
        nombre = "";
        precio = "";
        stock = "";
    };

    // Ejecutar al montar el componente
    onMount(() => {
        fetchProductos();
    });
</script>

<main class="container mt-5">
    <div class="row justify-content-center">
        <div class="col-md-8">
            <h1 class="text-center mb-4">Gestión de Productos</h1>

            <!-- Formulario para agregar o editar productos -->
            <div class="card mb-4 shadow-sm border-0">
                <div class="card-header bg-primary text-white">
                    <h5 class="mb-0">{editId ? "Editar Producto" : "Agregar Producto"}</h5>
                </div>
                <div class="card-body">
                    <form on:submit|preventDefault={editId ? actualizarProducto : agregarProducto}>
                        <div class="mb-3">
                            <label for="nombre" class="form-label">Nombre</label>
                            <input
                                id="nombre"
                                type="text"
                                class="form-control"
                                bind:value={nombre}
                                placeholder="Ingresa el nombre del producto"
                                required
                            />
                        </div>
                        <div class="mb-3">
                            <label for="precio" class="form-label">Precio</label>
                            <input
                                id="precio"
                                type="number"
                                class="form-control"
                                bind:value={precio}
                                placeholder="Ingresa el precio"
                                required
                            />
                        </div>
                        <div class="mb-3">
                            <label for="stock" class="form-label">Stock</label>
                            <input
                                id="stock"
                                type="number"
                                class="form-control"
                                bind:value={stock}
                                placeholder="Cantidad disponible"
                                required
                            />
                        </div>
                        <div class="d-flex justify-content-between">
                            <button type="submit" class="btn btn-success">
                                {editId ? "Actualizar Producto" : "Agregar Producto"}
                            </button>
                            {#if editId}
                                <button type="button" class="btn btn-secondary" on:click={limpiarFormulario}>
                                    Cancelar
                                </button>
                            {/if}
                        </div>
                    </form>
                </div>
            </div>

            <!-- Tabla para mostrar productos -->
            <div class="card shadow-sm border-0">
                <div class="card-header bg-secondary text-white">
                    <h5 class="mb-0">Lista de Productos</h5>
                </div>
                <div class="card-body p-0">
                    {#if productos.length > 0}
                        <table class="table table-striped table-hover m-0">
                            <thead class="table-light">
                                <tr>
                                    <th>ID</th>
                                    <th>Nombre</th>
                                    <th>Precio</th>
                                    <th>Stock</th>
                                    <th class="text-center">Acciones</th>
                                </tr>
                            </thead>
                            <tbody>
                                {#each productos as producto}
                                    <tr>
                                        <td>{producto.id}</td>
                                        <td>{producto.nombre}</td>
                                        <td>${producto.precio}</td>
                                        <td>{producto.stock}</td>
                                        <td class="text-center">
                                            <button
                                                class="btn btn-warning btn-sm me-2"
                                                on:click={() => seleccionarProducto(producto)}
                                            >
                                                Editar
                                            </button>
                                            <button
                                                class="btn btn-danger btn-sm"
                                                on:click={() => eliminarProducto(producto.id)}
                                            >
                                                Eliminar
                                            </button>
                                        </td>
                                    </tr>
                                {/each}
                            </tbody>
                        </table>
                    {:else}
                        <p class="text-center p-3 mb-0">No hay productos registrados.</p>
                    {/if}
                </div>
            </div>
        </div>
    </div>
</main>

<style>
    .card {
        border-radius: 0.5rem;
    }

    .btn {
        transition: all 0.2s ease-in-out;
    }

    .btn:hover {
        transform: scale(1.05);
    }

    .table thead {
        background-color: #f8f9fa;
    }

    .table-hover tbody tr:hover {
        background-color: #f1f1f1;
    }

    .card-header {
        border-bottom: none;
    }
</style>
