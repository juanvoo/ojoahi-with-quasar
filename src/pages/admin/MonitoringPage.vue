<template>
  <q-page padding>
    <div class="page-container">
      <div class="row q-col-gutter-md">
        <div class="col-12">
          <q-card class="q-pa-md">
            <div class="text-h5 q-mb-md">Panel de Monitorización</div>
            <p class="text-subtitle1 text-grey-7">
              Monitoriza el rendimiento y estado de la aplicación.
            </p>
          </q-card>
        </div>

        <!-- Grafana Dashboard -->
        <div class="col-12">
          <q-card>
            <q-tabs
              v-model="activeTab"
              dense
              class="text-grey"
              active-color="primary"
              indicator-color="primary"
              align="justify"
              narrow-indicator
            >
              <q-tab name="dashboard" label="Dashboard" icon="dashboard" />
              <q-tab name="users" label="Usuarios" icon="people" />
              <q-tab name="requests" label="Solicitudes" icon="help" />
              <q-tab name="chat" label="Chat" icon="chat" />
              <q-tab name="logs" label="Logs" icon="list" />
            </q-tabs>

            <q-separator />

            <q-tab-panels v-model="activeTab" animated>
              <q-tab-panel name="dashboard">
                <div class="text-h6 q-mb-md">Dashboard Principal</div>
                <div class="grafana-container">
                  <iframe
                    :src="grafanaUrl + '/d/main-dashboard/main-dashboard?orgId=1&refresh=10s'"
                    width="100%"
                    height="600"
                    frameborder="0"
                  ></iframe>
                </div>
              </q-tab-panel>

              <q-tab-panel name="users">
                <div class="text-h6 q-mb-md">Monitorización de Usuarios</div>
                <div class="grafana-container">
                  <iframe
                    :src="grafanaUrl + '/d/users-dashboard/users-dashboard?orgId=1&refresh=10s'"
                    width="100%"
                    height="600"
                    frameborder="0"
                  ></iframe>
                </div>
              </q-tab-panel>

              <q-tab-panel name="requests">
                <div class="text-h6 q-mb-md">Monitorización de Solicitudes</div>
                <div class="grafana-container">
                  <iframe
                    :src="grafanaUrl + '/d/requests-dashboard/requests-dashboard?orgId=1&refresh=10s'"
                    width="100%"
                    height="600"
                    frameborder="0"
                  ></iframe>
                </div>
              </q-tab-panel>

              <q-tab-panel name="chat">
                <div class="text-h6 q-mb-md">Monitorización de Chat</div>
                <div class="row q-col-gutter-md">
                  <div class="col-12 col-md-6">
                    <q-card class="q-pa-md">
                      <div class="text-subtitle1">Diagnóstico del Sistema de Chat</div>
                      <q-btn 
                        color="primary" 
                        label="Ejecutar Diagnóstico" 
                        class="q-mt-sm"
                        @click="runChatDiagnostic"
                        :loading="diagnosticLoading"
                      />
                      
                      <q-card-section v-if="diagnosticResult">
                        <pre class="diagnostic-result">{{ JSON.stringify(diagnosticResult, null, 2) }}</pre>
                      </q-card-section>
                    </q-card>
                  </div>
                  
                  <div class="col-12 col-md-6">
                    <q-card class="q-pa-md">
                      <div class="text-subtitle1">Herramientas de Chat</div>
                      
                      <q-form @submit="createTestConversation" class="q-mt-sm">
                        <div class="row q-col-gutter-sm">
                          <div class="col-12 col-md-6">
                            <q-input
                              v-model="testConversation.user1_id"
                              label="ID Usuario 1"
                              type="number"
                              outlined
                              dense
                              required
                            />
                          </div>
                          <div class="col-12 col-md-6">
                            <q-input
                              v-model="testConversation.user2_id"
                              label="ID Usuario 2"
                              type="number"
                              outlined
                              dense
                              required
                            />
                          </div>
                          <div class="col-12">
                            <q-input
                              v-model="testConversation.message"
                              label="Mensaje de prueba"
                              outlined
                              dense
                            />
                          </div>
                          <div class="col-12">
                            <q-btn 
                              type="submit" 
                              color="primary" 
                              label="Crear Conversación de Prueba" 
                              :loading="testConversationLoading"
                            />
                            <q-btn 
                              color="secondary" 
                              label="Corregir Problemas" 
                              class="q-ml-sm"
                              @click="fixChatIssues"
                              :loading="fixingIssues"
                            />
                          </div>
                        </div>
                      </q-form>
                      
                      <q-card-section v-if="testConversationResult">
                        <div class="text-subtitle2">Resultado:</div>
                        <pre class="diagnostic-result">{{ JSON.stringify(testConversationResult, null, 2) }}</pre>
                      </q-card-section>
                    </q-card>
                  </div>
                  
                  <div class="col-12">
                    <div class="grafana-container">
                      <iframe
                        :src="grafanaUrl + '/d/chat-dashboard/chat-dashboard?orgId=1&refresh=10s'"
                        width="100%"
                        height="400"
                        frameborder="0"
                      ></iframe>
                    </div>
                  </div>
                </div>
              </q-tab-panel>

              <q-tab-panel name="logs">
                <div class="text-h6 q-mb-md">Logs del Sistema</div>
                <div class="grafana-container">
                  <iframe
                    :src="grafanaUrl + '/explore?orgId=1&left=%7B%22datasource%22:%22loki%22,%22queries%22:%5B%7B%22refId%22:%22A%22,%22expr%22:%22%7Bapp%3D%5C%22ojoahi%5C%22%7D%22%7D%5D%7D'"
                    width="100%"
                    height="600"
                    frameborder="0"
                  ></iframe>
                </div>
              </q-tab-panel>
            </q-tab-panels>
          </q-card>
        </div>
      </div>
    </div>
  </q-page>
</template>

<script>
import { defineComponent, ref } from 'vue'
import { api } from 'src/boot/axios'
import { Notify } from 'quasar'
import { useChatStore } from 'src/stores/chat'

export default defineComponent({
  name: 'MonitoringPage',
  
  setup() {
    const activeTab = ref('dashboard')
    const grafanaUrl = ref(process.env.GRAFANA_URL || 'http://localhost:3000')
    const chatStore = useChatStore()
    
    // Chat diagnostic
    const diagnosticLoading = ref(false)
    const diagnosticResult = ref(null)
    
    // Test conversation
    const testConversationLoading = ref(false)
    const testConversationResult = ref(null)
    const testConversation = ref({
      user1_id: '',
      user2_id: '',
      message: 'Mensaje de prueba'
    })
    
    // Fix issues
    const fixingIssues = ref(false)
    
    const runChatDiagnostic = async () => {
      try {
        diagnosticLoading.value = true
        const response = await api.get('/chat/debug')
        diagnosticResult.value = response.data
        
        if (response.data.success) {
          Notify.create({
            type: 'positive',
            message: 'Diagnóstico completado'
          })
        } else {
          Notify.create({
            type: 'warning',
            message: 'Diagnóstico completado con problemas'
          })
        }
      } catch (error) {
        console.error('Error en diagnóstico:', error)
        Notify.create({
          type: 'negative',
          message: 'Error al ejecutar diagnóstico'
        })
        diagnosticResult.value = { success: false, error: error.message }
      } finally {
        diagnosticLoading.value = false
      }
    }
    
    const createTestConversation = async () => {
      try {
        testConversationLoading.value = true
        const response = await api.post('/chat/test-conversation', {
          user1_id: testConversation.value.user1_id,
          user2_id: testConversation.value.user2_id,
          message: testConversation.value.message
        })
        
        testConversationResult.value = response.data
        
        if (response.data.success) {
          Notify.create({
            type: 'positive',
            message: 'Conversación de prueba creada'
          })
        } else {
          Notify.create({
            type: 'negative',
            message: 'Error al crear conversación de prueba'
          })
        }
      } catch (error) {
        console.error('Error creando conversación de prueba:', error)
        Notify.create({
          type: 'negative',
          message: 'Error al crear conversación de prueba'
        })
        testConversationResult.value = { success: false, error: error.message }
      } finally {
        testConversationLoading.value = false
      }
    }
    
    const fixChatIssues = async () => {
      try {
        fixingIssues.value = true
        const response = await api.post('/chat/fix')
        
        if (response.data.success) {
          Notify.create({
            type: 'positive',
            message: 'Problemas corregidos exitosamente'
          })
        } else {
          Notify.create({
            type: 'negative',
            message: 'Error al corregir problemas'
          })
        }
      } catch (error) {
        console.error('Error corrigiendo problemas:', error)
        Notify.create({
          type: 'negative',
          message: 'Error al corregir problemas'
        })
      } finally {
        fixingIssues.value = false
      }
    }
    
    return {
      activeTab,
      grafanaUrl,
      diagnosticLoading,
      diagnosticResult,
      runChatDiagnostic,
      testConversation,
      testConversationLoading,
      testConversationResult,
      createTestConversation,
      fixingIssues,
      fixChatIssues
    }
  }
})
</script>

<style scoped>
.grafana-container {
  border: 1px solid #ddd;
  border-radius: 4px;
  overflow: hidden;
}

.diagnostic-result {
  background: #f5f5f5;
  padding: 10px;
  border-radius: 4px;
  overflow: auto;
  max-height: 300px;
  font-family: monospace;
  font-size: 12px;
}
</style>
