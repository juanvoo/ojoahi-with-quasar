<template>
  <q-page class="q-pa-md">
    <div class="row q-col-gutter-md">
      <!-- Header & Filters -->
      <div class="col-12">
        <div class="row items-center justify-between q-mb-md">
          <h1 class="text-h4 q-my-none">Gestión de Usuarios</h1>
          <q-btn-group spread>
            <q-btn
              :color="activeFilter === 'all' ? 'primary' : 'grey'"
              label="Todos"
              @click="setFilter('all')"
            />
            <q-btn
              :color="activeFilter === 'unverified' ? 'warning' : 'grey'"
              label="No Verificados"
              @click="setFilter('unverified')"
            />
            <q-btn
              :color="activeFilter === 'blocked' ? 'negative' : 'grey'"
              label="Bloqueados"
              @click="setFilter('blocked')"
            />
          </q-btn-group>
        </div>

        <!-- Search & Role Filter -->
        <div class="row q-col-gutter-md q-mb-md">
          <div class="col-12 col-md-6">
            <q-input
              v-model="search"
              outlined
              dense
              placeholder="Buscar por nombre, email o usuario"
              @update:model-value="debounceSearch"
            >
              <template v-slot:append>
                <q-icon name="search" />
              </template>
            </q-input>
          </div>
          <div class="col-12 col-md-6">
            <q-select
              v-model="selectedRole"
              :options="roleOptions"
              outlined
              dense
              label="Filtrar por rol"
              @update:model-value="loadUsers"
            />
          </div>
        </div>
      </div>

      <!-- Users Table -->
      <div class="col-12">
        <q-table
          :rows="users"
          :columns="columns"
          row-key="id"
          :loading="loading"
          :pagination.sync="pagination"
          @request="onRequest"
        >
          <!-- User Status -->
          <template v-slot:body-cell-status="props">
            <q-td :props="props">
              <q-chip
                :color="getStatusColor(props.row)"
                text-color="white"
                size="sm"
              >
                {{ getStatusLabel(props.row) }}
              </q-chip>
            </q-td>
          </template>

          <!-- Actions -->
          <template v-slot:body-cell-actions="props">
            <q-td :props="props">
              <q-btn-group spread flat>
                <q-btn
                  v-if="!props.row.is_verified"
                  color="positive"
                  icon="check_circle"
                  flat
                  dense
                  @click="verifyUser(props.row)"
                >
                  <q-tooltip>Verificar usuario</q-tooltip>
                </q-btn>
                <q-btn
                  :color="props.row.is_blocked ? 'positive' : 'negative'"
                  :icon="props.row.is_blocked ? 'lock_open' : 'lock'"
                  flat
                  dense
                  @click="toggleBlockUser(props.row)"
                >
                  <q-tooltip>{{ props.row.is_blocked ? 'Desbloquear' : 'Bloquear' }}</q-tooltip>
                </q-btn>
                <q-btn
                  color="primary"
                  icon="visibility"
                  flat
                  dense
                  @click="viewUserDetails(props.row)"
                >
                  <q-tooltip>Ver detalles</q-tooltip>
                </q-btn>
              </q-btn-group>
            </q-td>
          </template>
        </q-table>
      </div>
    </div>

    <!-- User Details Dialog -->
    <q-dialog v-model="showUserDetails" persistent>
      <q-card style="min-width: 350px">
        <q-card-section class="row items-center q-pb-none">
          <div class="text-h6">Detalles del Usuario</div>
          <q-space />
          <q-btn icon="close" flat round dense v-close-popup />
        </q-card-section>

        <q-card-section v-if="selectedUser">
          <div class="row q-col-gutter-md">
            <div class="col-12">
              <q-item>
                <q-item-section avatar>
                  <q-avatar>
                    <img :src="selectedUser.profile_image || 'https://cdn.quasar.dev/img/avatar.png'">
                  </q-avatar>
                </q-item-section>
                <q-item-section>
                  <q-item-label>{{ selectedUser.name }}</q-item-label>
                  <q-item-label caption>{{ selectedUser.username }}</q-item-label>
                </q-item-section>
              </q-item>
            </div>

            <div class="col-12">
              <q-list bordered>
                <q-item>
                  <q-item-section>
                    <q-item-label caption>Email</q-item-label>
                    <q-item-label>{{ selectedUser.email }}</q-item-label>
                  </q-item-section>
                </q-item>

                <q-item>
                  <q-item-section>
                    <q-item-label caption>Rol</q-item-label>
                    <q-item-label>{{ getRoleName(selectedUser.role) }}</q-item-label>
                  </q-item-section>
                </q-item>

                <q-item>
                  <q-item-section>
                    <q-item-label caption>Fecha de registro</q-item-label>
                    <q-item-label>{{ formatDate(selectedUser.created_at) }}</q-item-label>
                  </q-item-section>
                </q-item>

                <q-item>
                  <q-item-section>
                    <q-item-label caption>Solicitudes totales</q-item-label>
                    <q-item-label>{{ selectedUser.total_requests }}</q-item-label>
                  </q-item-section>
                </q-item>
              </q-list>
            </div>
          </div>
        </q-card-section>

        <q-card-actions align="right">
          <q-btn flat label="Cerrar" color="primary" v-close-popup />
        </q-card-actions>
      </q-card>
    </q-dialog>

    <!-- Block User Dialog -->
    <q-dialog v-model="showBlockDialog" persistent>
      <q-card style="min-width: 350px">
        <q-card-section>
          <div class="text-h6">{{ selectedUser?.is_blocked ? 'Desbloquear' : 'Bloquear' }} Usuario</div>
        </q-card-section>

        <q-card-section v-if="!selectedUser?.is_blocked">
          <q-input
            v-model="blockReason"
            type="textarea"
            label="Razón del bloqueo"
            outlined
          />
        </q-card-section>

        <q-card-actions align="right">
          <q-btn flat label="Cancelar" color="primary" v-close-popup />
          <q-btn 
            :label="selectedUser?.is_blocked ? 'Desbloquear' : 'Bloquear'"
            :color="selectedUser?.is_blocked ? 'positive' : 'negative'"
            @click="confirmBlockUser"
          />
        </q-card-actions>
      </q-card>
    </q-dialog>
  </q-page>
</template>

<script>
import { defineComponent, ref, onMounted } from 'vue'
import { api } from 'boot/axios'
import { useQuasar } from 'quasar'
import { date } from 'quasar'

export default defineComponent({
  name: 'UsersPage',

  setup () {
    const $q = useQuasar()
    const loading = ref(false)
    const users = ref([])
    const search = ref('')
    const selectedRole = ref(null)
    const activeFilter = ref('all')
    const showUserDetails = ref(false)
    const showBlockDialog = ref(false)
    const selectedUser = ref(null)
    const blockReason = ref('')

    const pagination = ref({
      sortBy: 'created_at',
      descending: true,
      page: 1,
      rowsPerPage: 20,
      rowsNumber: 0
    })

    const columns = [
      {
        name: 'username',
        required: true,
        label: 'Usuario',
        align: 'left',
        field: row => row.username,
        sortable: true
      },
      {
        name: 'email',
        required: true,
        label: 'Email',
        align: 'left',
        field: row => row.email,
        sortable: true
      },
      {
        name: 'role',
        required: true,
        label: 'Rol',
        align: 'left',
        field: row => getRoleName(row.role),
        sortable: true
      },
      {
        name: 'status',
        required: true,
        label: 'Estado',
        align: 'left',
        field: row => getStatusLabel(row)
      },
      {
        name: 'created_at',
        required: true,
        label: 'Registro',
        align: 'left',
        field: row => formatDate(row.created_at),
        sortable: true
      },
      {
        name: 'actions',
        required: true,
        label: 'Acciones',
        align: 'center'
      }
    ]

    const roleOptions = [
      { label: 'Todos', value: null },
      { label: 'Invidente', value: 'blind' },
      { label: 'Voluntario', value: 'volunteer' },
      { label: 'Administrador', value: 'admin' }
    ]

    function getRoleName(role) {
      switch (role) {
        case 'blind': return 'Invidente'
        case 'volunteer': return 'Voluntario'
        case 'admin': return 'Administrador'
        default: return role
      }
    }

    function getStatusColor(user) {
      if (user.is_blocked) return 'negative'
      if (!user.is_verified) return 'warning'
      return 'positive'
    }

    function getStatusLabel(user) {
      if (user.is_blocked) return 'Bloqueado'
      if (!user.is_verified) return 'No verificado'
      return 'Activo'
    }

    function formatDate(dateStr) {
      return date.formatDate(dateStr, 'DD/MM/YYYY HH:mm')
    }

    async function loadUsers() {
      try {
        loading.value = true
        const params = {
          page: pagination.value.page,
          limit: pagination.value.rowsPerPage,
          role: selectedRole.value,
          status: activeFilter.value === 'all' ? null : activeFilter.value,
          search: search.value
        }

        const response = await api.get('/admin/users', { params })
        users.value = response.data.users
        pagination.value.rowsNumber = response.data.pagination.total
      } catch (error) {
        console.error('Error loading users:', error)
        $q.notify({
          type: 'negative',
          message: 'Error al cargar usuarios'
        })
      } finally {
        loading.value = false
      }
    }

    function setFilter(filter) {
      activeFilter.value = filter
      loadUsers()
    }

    function viewUserDetails(user) {
      selectedUser.value = user
      showUserDetails.value = true
    }

    function toggleBlockUser(user) {
      selectedUser.value = user
      blockReason.value = ''
      showBlockDialog.value = true
    }

    async function confirmBlockUser() {
      try {
        const action = selectedUser.value.is_blocked ? 'unblock' : 'block'
        await api.patch(`/admin/users/${selectedUser.value.id}/status`, {
          action,
          reason: blockReason.value
        })

        $q.notify({
          type: 'positive',
          message: `Usuario ${action === 'block' ? 'bloqueado' : 'desbloqueado'} correctamente`
        })

        showBlockDialog.value = false
        loadUsers()
      } catch (error) {
        console.error('Error updating user status:', error)
        $q.notify({
          type: 'negative',
          message: 'Error al actualizar el estado del usuario'
        })
      }
    }

    async function verifyUser(user) {
      try {
        await api.patch(`/admin/users/${user.id}/status`, {
          action: 'verify'
        })

        $q.notify({
          type: 'positive',
          message: 'Usuario verificado correctamente'
        })

        loadUsers()
      } catch (error) {
        console.error('Error verifying user:', error)
        $q.notify({
          type: 'negative',
          message: 'Error al verificar el usuario'
        })
      }
    }

    const debounceSearch = ref(null)
    debounceSearch.value = $q.debounce(() => {
      loadUsers()
    }, 300)

    function onRequest(props) {
      pagination.value = props.pagination
      loadUsers()
    }

    onMounted(() => {
      loadUsers()
    })

    return {
      loading,
      users,
      columns,
      pagination,
      search,
      selectedRole,
      roleOptions,
      activeFilter,
      showUserDetails,
      showBlockDialog,
      selectedUser,
      blockReason,
      getRoleName,
      getStatusColor,
      getStatusLabel,
      formatDate,
      setFilter,
      loadUsers,
      viewUserDetails,
      toggleBlockUser,
      confirmBlockUser,
      verifyUser,
      debounceSearch,
      onRequest
    }
  }
})
</script>