<script>
    import { onMount } from "svelte";

    let clientes = [];
    let productos = [];
    let pedido = { cliente_id: null, detalles: [] };
    let total = 0;

    let selectedProducto = null; // Producto seleccionado
    let cantidad = 1; // Cantidad de productos para agregar

    // Obtener clientes
    const fetchClientes = async () => {
        const res = await fetch("http://localhost:3000/clientes");
        clientes = await res.json();
    };

    // Obtener productos
    const fetchProductos = async () => {
        const res = await fetch("http://localhost:3000/productos");
        productos = await res.json();
    };

    // Agregar producto al pedido
    const agregarProducto = (producto_id, cantidad) => {
        const producto = productos.find((p) => p.id === producto_id);
        if (!producto || cantidad <= 0) return;

        const subtotal = producto.precio * cantidad;
        pedido.detalles.push({ producto_id, cantidad, subtotal, nombre: producto.nombre });
        calcularTotal();
        limpiarProducto();
    };

    // Eliminar producto del pedido
    const eliminarProducto = (index) => {
        pedido.detalles.splice(index, 1);
        calcularTotal();
    };

    // Calcular el total del pedido
    const calcularTotal = () => {
        total = pedido.detalles.reduce((sum, item) => sum + item.subtotal, 0);
    };

    // Registrar el pedido
    const registrarPedido = async () => {
        if (!pedido.cliente_id || pedido.detalles.length === 0) {
            alert("Seleccione un cliente y agregue productos al pedido.");
            return;
        }

        await fetch("http://localhost:3000/pedidos", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(pedido),
        });

        alert("Pedido registrado exitosamente.");
        pedido = { cliente_id: null, detalles: [] };
        total = 0;
        limpiarProducto();
    };

    // Limpiar selección de producto
    const limpiarProducto = () => {
        selectedProducto = null;
        cantidad = 1;
    };

    onMount(() => {
        fetchClientes();
        fetchProductos();
    });
</script>

<main class="container mt-5">
    <div class="row justify-content-center">
        <div class="col-md-10">
            <h1 class="text-center mb-4">Gestión de Pedidos</h1>

            <!-- Selección de cliente -->
            <div class="card mb-4 shadow-sm border-0">
                <div class="card-header bg-primary text-white">
                    <h5 class="mb-0">Seleccionar Cliente</h5>
                </div>
                <div class="card-body">
                    <div class="mb-3">
                        <label for="cliente" class="form-label">Cliente</label>
                        <select
                            id="cliente"
                            class="form-select"
                            bind:value={pedido.cliente_id}
                        >
                            <option value="" disabled selected>Seleccione un cliente</option>
                            {#each clientes as cliente}
                                <option value={cliente.id}>{cliente.nombre}</option>
                            {/each}
                        </select>
                    </div>
                </div>
            </div>

            <!-- Agregar productos -->
            <div class="card mb-4 shadow-sm border-0">
                <div class="card-header bg-secondary text-white">
                    <h5 class="mb-0">Agregar Productos</h5>
                </div>
                <div class="card-body">
                    <div class="row g-3 align-items-end">
                        <div class="col-md-6">
                            <label for="producto" class="form-label">Producto</label>
                            <select
                                id="producto"
                                class="form-select"
                                bind:value={selectedProducto}
                            >
                                <option value="" disabled selected>Seleccione un producto</option>
                                {#each productos as producto}
                                    <option value={producto.id}>{producto.nombre} (${producto.precio})</option>
                                {/each}
                            </select>
                        </div>
                        <div class="col-md-3">
                            <label for="cantidad" class="form-label">Cantidad</label>
                            <input
                                id="cantidad"
                                type="number"
                                class="form-control"
                                bind:value={cantidad}
                                min="1"
                            />
                        </div>
                        <div class="col-md-3">
                            <button
                                class="btn btn-success w-100"
                                on:click={() => agregarProducto(selectedProducto, cantidad)}
                            >
                                Agregar Producto
                            </button>
                        </div>
                    </div>
                </div>
            </div>

            <!-- Detalles del pedido -->
            <div class="card shadow-sm border-0 mb-4">
                <div class="card-header bg-info text-white">
                    <h5 class="mb-0">Detalles del Pedido</h5>
                </div>
                <div class="card-body p-0">
                    {#if pedido.detalles.length > 0}
                        <table class="table table-striped table-hover m-0">
                            <thead class="table-light">
                                <tr>
                                    <th>Producto</th>
                                    <th>Cantidad</th>
                                    <th>Subtotal</th>
                                    <th class="text-center">Acciones</th>
                                </tr>
                            </thead>
                            <tbody>
                                {#each pedido.detalles as detalle, index}
                                    <tr>
                                        <td>{detalle.nombre}</td>
                                        <td>{detalle.cantidad}</td>
                                        <td>${detalle.subtotal}</td>
                                        <td class="text-center">
                                            <button
                                                class="btn btn-danger btn-sm"
                                                on:click={() => eliminarProducto(index)}
                                            >
                                                Eliminar
                                            </button>
                                        </td>
                                    </tr>
                                {/each}
                            </tbody>
                        </table>
                    {:else}
                        <p class="text-center p-3 mb-0">No hay productos en el pedido.</p>
                    {/if}
                </div>
            </div>

            <!-- Total del pedido y registro -->
            <div class="d-flex justify-content-between align-items-center">
                <h4>Total: ${total}</h4>
                <button class="btn btn-primary" on:click={registrarPedido}>
                    Registrar Pedido
                </button>
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
