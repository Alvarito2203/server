<script>
    import { onMount } from "svelte";

    let clientes = [];
    let productos = [];
    let pedido = {
        cliente_id: null,
        detalles: []
    };

    // Total del pedido
    let total = 0;

    // Leer clientes
    const fetchClientes = async () => {
        const res = await fetch("http://localhost:3000/clientes");
        clientes = await res.json();
    };

    // Leer productos
    const fetchProductos = async () => {
        const res = await fetch("http://localhost:3000/productos");
        productos = await res.json();
    };

    // Añadir producto al pedido
    const agregarProducto = (producto_id, cantidad) => {
        const producto = productos.find(p => p.id === producto_id);
        if (!producto) return;

        const subtotal = producto.precio * cantidad;
        pedido.detalles.push({ producto_id, cantidad, subtotal });
        calcularTotal();
    };

    // Eliminar producto del pedido
    const eliminarProducto = (index) => {
        pedido.detalles.splice(index, 1);
        calcularTotal();
    };

    // Calcular total del pedido
    const calcularTotal = () => {
        total = pedido.detalles.reduce((sum, item) => sum + item.subtotal, 0);
    };

    // Registrar pedido
    const registrarPedido = async () => {
        if (!pedido.cliente_id || pedido.detalles.length === 0) {
            alert("Seleccione un cliente y agregue productos al pedido.");
            return;
        }

        await fetch("http://localhost:3000/pedidos", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(pedido)
        });

        alert("Pedido registrado exitosamente.");
        limpiarFormulario();
    };

    const limpiarFormulario = () => {
        pedido = { cliente_id: null, detalles: [] };
        total = 0;
    };

    onMount(() => {
        fetchClientes();
        fetchProductos();
    });
</script>

<main class="container mt-5">
    <h1 class="text-center mb-4">Gestión de Pedidos</h1>

    <!-- Selección de cliente -->
    <div class="mb-4">
        <label class="form-label">Seleccionar Cliente</label>
        <select bind:value={pedido.cliente_id} class="form-select" required>
            <option value="" disabled selected>Seleccione un cliente</option>
            {#each clientes as cliente}
                <option value={cliente.id}>{cliente.nombre}</option>
            {/each}
        </select>
    </div>

    <!-- Selección de productos -->
    <div class="card mb-4">
        <div class="card-body">
            <h5 class="card-title">Agregar Productos</h5>
            <div class="row g-3">
                {#each productos as producto}
                    <div class="col-md-4">
                        <div class="card">
                            <div class="card-body">
                                <h6>{producto.nombre}</h6>
                                <p>Precio: ${producto.precio}</p>
                                <p>Stock: {producto.stock}</p>
                                <input
                                    type="number"
                                    placeholder="Cantidad"
                                    min="1"
                                    max={producto.stock}
                                    class="form-control mb-2"
                                    bind:this={producto.cantidadInput}
                                />
                                <button
                                    class="btn btn-primary w-100"
                                    on:click={() => agregarProducto(producto.id, +producto.cantidadInput.value)}
                                    disabled={producto.stock === 0}
                                >
                                    Agregar
                                </button>
                            </div>
                        </div>
                    </div>
                {/each}
            </div>
        </div>
    </div>

    <!-- Detalles del pedido -->
    <div class="card mb-4">
        <div class="card-body">
            <h5 class="card-title">Detalles del Pedido</h5>
            {#if pedido.detalles.length > 0}
                <table class="table">
                    <thead>
                        <tr>
                            <th>Producto</th>
                            <th>Cantidad</th>
                            <th>Subtotal</th>
                            <th>Acciones</th>
                        </tr>
                    </thead>
                    <tbody>
                        {#each pedido.detalles as detalle, index}
                            <tr>
                                <td>{productos.find(p => p.id === detalle.producto_id)?.nombre}</td>
                                <td>{detalle.cantidad}</td>
                                <td>${detalle.subtotal}</td>
                                <td>
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
                <p>No hay productos en el pedido.</p>
            {/if}
        </div>
    </div>

    <!-- Total y botón para registrar -->
    <div class="text-end">
        <h4>Total: ${total}</h4>
        <button class="btn btn-success" on:click={registrarPedido}>Registrar Pedido</button>
    </div>
</main>
