<script>
    import { onMount } from "svelte";

    let productos = [];
    let nombre = "";
    let precio = "";
    let stock = "";
    let editId = null;

    // Leer productos
    const fetchProductos = async () => {
        const res = await fetch("http://localhost:3000/productos");
        productos = await res.json();
    };

    // Crear producto
    const agregarProducto = async () => {
        await fetch("http://localhost:3000/productos", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ nombre, precio, stock }),
        });
        fetchProductos();
        limpiarFormulario();
    };

    // Actualizar producto
    const actualizarProducto = async () => {
        await fetch(`http://localhost:3000/productos/${editId}`, {
            method: "PUT",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ nombre, precio, stock }),
        });
        fetchProductos();
        limpiarFormulario();
    };

    // Eliminar producto
    const eliminarProducto = async (id) => {
        await fetch(`http://localhost:3000/productos/${id}`, {
            method: "DELETE",
        });
        fetchProductos();
    };

    // Seleccionar producto para editar
    const seleccionarProducto = (producto) => {
        editId = producto.id;
        nombre = producto.nombre;
        precio = producto.precio;
        stock = producto.stock;
    };

    const limpiarFormulario = () => {
        editId = null;
        nombre = "";
        precio = "";
        stock = "";
    };

    onMount(() => {
        fetchProductos();
    });
</script>

<main class="container mt-5">
    <h2>Gestión de Productos</h2>

    <!-- Formulario para agregar/editar productos -->
    <div class="card p-3 my-4">
        <form on:submit|preventDefault={editId ? actualizarProducto : agregarProducto}>
            <div class="mb-3">
                <label for="nombre" class="form-label">Nombre</label>
                <input
                    id="nombre"
                    class="form-control"
                    bind:value={nombre}
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
                    required
                />
            </div>
            <button class="btn btn-primary">
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

    <!-- Tabla de productos -->
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
                    <td>{producto.precio}</td>
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
</main>
