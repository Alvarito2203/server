<script>
    import { onMount } from "svelte";

    let productos = [];
    let nombre = "";
    let precio = "";
    let stock = "";
    let editId = null;

    // Obtener productos desde el backend
    const fetchProductos = async () => {
        const res = await fetch("http://localhost:3000/productos");
        productos = await res.json();
    };

    // Agregar producto
    const agregarProducto = async () => {
        if (!nombre || !precio || !stock) {
            alert("Por favor, completa todos los campos.");
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

    // Actualizar producto
    const actualizarProducto = async () => {
        if (!nombre || !precio || !stock) {
            alert("Por favor, completa todos los campos.");
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
            await fetch(`http://localhost:3000/productos/${id}`, {
                method: "DELETE",
            });
            fetchProductos(); // Actualiza la lista de productos
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
    <h1 class="text-center mb-4">Gestión de Productos</h1>

    <!-- Formulario para agregar o editar productos -->
    <div class="card mb-4 shadow-sm">
        <div class="card-body">
            <h4>{editId ? "Editar Producto" : "Agregar Producto"}</h4>
            <form on:submit|preventDefault={editId ? actualizarProducto : agregarProducto}>
                <div class="mb-3">
                    <label for="nombre" class="form-label">Nombre</label>
                    <input
                        id="nombre"
                        class="form-control"
                        bind:value={nombre}
                        placeholder="Nombre del producto"
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
                        placeholder="Precio"
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
                        placeholder="Stock disponible"
                        required
                    />
                </div>
                <button type="submit" class="btn btn-primary">
                    {editId ? "Actualizar Producto" : "Agregar Producto"}
                </button>
                {#if editId}
                    <button
                        type="button"
                        class="btn btn-secondary ms-3"
                        on:click={limpiarFormulario}
                    >
                        Cancelar
                    </button>
                {/if}
            </form>
        </div>
    </div>

    <!-- Tabla para mostrar los productos -->
    <div class="card shadow-sm">
        <div class="card-body">
            <h4 class="mb-4">Lista de Productos</h4>
            {#if productos.length > 0}
                <table class="table table-striped">
                    <thead>
                        <tr>
                            <th>ID</th>
                            <th>Nombre</th>
                            <th>Precio</th>
                            <th>Stock</th>
                            <th>Acciones</th>
                        </tr>
                    </thead>
                    <tbody>
                        {#each productos as producto}
                            <tr>
                                <td>{producto.id}</td>
                                <td>{producto.nombre}</td>
                                <td>${producto.precio}</td>
                                <td>{producto.stock}</td>
                                <td>
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
                <p class="text-center">No hay productos disponibles.</p>
            {/if}
        </div>
    </div>
</main>

<style>
    .card {
        border-radius: 0.5rem;
    }

    button {
        transition: background-color 0.3s ease;
    }

    button:hover {
        background-color: #0056b3;
    }

    .btn-danger:hover {
        background-color: #dc3545;
    }
</style>
