<script>
    import { onMount } from "svelte";

    let clientes = [];
    let nombre = "";
    let email = "";
    let editId = null;

    // Obtener clientes del backend
    const fetchClientes = async () => {
        const res = await fetch("http://localhost:3000/clientes");
        clientes = await res.json();
    };

    // Agregar cliente
    const agregarCliente = async () => {
        if (!nombre || !email) {
            alert("Por favor, completa todos los campos.");
            return;
        }
        await fetch("http://localhost:3000/clientes", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ nombre, email }),
        });
        fetchClientes(); // Actualiza la lista de clientes
        limpiarFormulario();
    };

    // Actualizar cliente
    const actualizarCliente = async () => {
        if (!nombre || !email) {
            alert("Por favor, completa todos los campos.");
            return;
        }
        await fetch(`http://localhost:3000/clientes/${editId}`, {
            method: "PUT",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ nombre, email }),
        });
        fetchClientes(); // Actualiza la lista de clientes
        limpiarFormulario();
    };

       // Eliminar cliente
       const eliminarCliente = async (id) => {
    if (confirm("¿Estás seguro de que deseas eliminar este cliente?")) {
        const res = await fetch(`http://localhost:3000/clientes/${id}`, {
            method: "DELETE",
        });

        if (res.ok) {
            alert("Cliente eliminado correctamente.");
            fetchClientes(); // Actualiza la lista de clientes
        } else {
            alert("Error al eliminar el cliente. Asegúrate de que no esté relacionado con pedidos.");
        }
    }
};


    // Seleccionar cliente para edición
    const seleccionarCliente = (cliente) => {
        editId = cliente.id;
        nombre = cliente.nombre;
        email = cliente.email;
    };

    // Limpiar formulario
    const limpiarFormulario = () => {
        editId = null;
        nombre = "";
        email = "";
    };

    // Ejecutar al montar el componente
    onMount(() => {
        fetchClientes();
    });
</script>

<main class="container mt-5">
    <div class="row justify-content-center">
        <div class="col-md-8">
            <h1 class="text-center mb-4">Gestión de Clientes</h1>

            <!-- Formulario para agregar o editar cliente -->
            <div class="card mb-4 shadow-sm border-0">
                <div class="card-header bg-primary text-white">
                    <h5 class="mb-0">{editId ? "Editar Cliente" : "Agregar Cliente"}</h5>
                </div>
                <div class="card-body">
                    <form on:submit|preventDefault={editId ? actualizarCliente : agregarCliente}>
                        <div class="mb-3">
                            <label for="nombre" class="form-label">Nombre</label>
                            <input
                                id="nombre"
                                type="text"
                                class="form-control"
                                bind:value={nombre}
                                placeholder="Ingresa el nombre del cliente"
                                required
                            />
                        </div>
                        <div class="mb-3">
                            <label for="email" class="form-label">Email</label>
                            <input
                                id="email"
                                type="email"
                                class="form-control"
                                bind:value={email}
                                placeholder="Ingresa el email del cliente"
                                required
                            />
                        </div>
                        <div class="d-flex justify-content-between">
                            <button type="submit" class="btn btn-success">
                                {editId ? "Actualizar Cliente" : "Agregar Cliente"}
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

            <!-- Tabla para mostrar clientes -->
            <div class="card shadow-sm border-0">
                <div class="card-header bg-secondary text-white">
                    <h5 class="mb-0">Lista de Clientes</h5>
                </div>
                <div class="card-body p-0">
                    {#if clientes.length > 0}
                        <table class="table table-striped table-hover m-0">
                            <thead class="table-light">
                                <tr>
                                    <th>ID</th>
                                    <th>Nombre</th>
                                    <th>Email</th>
                                    <th class="text-center">Acciones</th>
                                </tr>
                            </thead>
                            <tbody>
                                {#each clientes as cliente}
                                    <tr>
                                        <td>{cliente.id}</td>
                                        <td>{cliente.nombre}</td>
                                        <td>{cliente.email}</td>
                                        <td class="text-center">
                                            <button
                                                class="btn btn-warning btn-sm me-2"
                                                on:click={() => seleccionarCliente(cliente)}
                                            >
                                                Editar
                                            </button>
                                            <button
                                                class="btn btn-danger btn-sm"
                                                on:click={() => eliminarCliente(cliente.id)}
                                            >
                                                Eliminar
                                            </button>
                                        </td>
                                    </tr>
                                {/each}
                            </tbody>
                        </table>
                    {:else}
                        <p class="text-center p-3 mb-0">No hay clientes registrados.</p>
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

