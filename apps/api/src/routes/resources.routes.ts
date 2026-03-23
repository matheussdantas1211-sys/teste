import { Router } from 'express';
import { authMiddleware } from '../middleware/auth';
import {
  createClient,
  createClientContact,
  createCollectionAgreement,
  createContract,
  createServiceOrder,
  createVehicle,
  enqueueCommand,
  getSettings,
  listClientContacts,
  listClients,
  listCollectionAgreements,
  listCommandQueue,
  listContracts,
  listInvoices,
  listServiceOrders,
  listVehicles,
  updateSettings
} from '../services/resources.service';

export const resourcesRouter = Router();
resourcesRouter.use(authMiddleware);

resourcesRouter.get('/clients', async (request, response, next) => {
  try {
    return response.json(await listClients(request.auth!.tenantId));
  } catch (error) {
    return next(error);
  }
});

resourcesRouter.post('/clients', async (request, response, next) => {
  try {
    return response.status(201).json(await createClient(request.auth!.tenantId, request.body));
  } catch (error) {
    return next(error);
  }
});

resourcesRouter.get('/client-contacts', async (request, response, next) => {
  try {
    return response.json(await listClientContacts(request.auth!.tenantId));
  } catch (error) {
    return next(error);
  }
});

resourcesRouter.post('/client-contacts', async (request, response, next) => {
  try {
    return response.status(201).json(await createClientContact(request.auth!.tenantId, request.body));
  } catch (error) {
    return next(error);
  }
});

resourcesRouter.get('/vehicles', async (request, response, next) => {
  try {
    return response.json(await listVehicles(request.auth!.tenantId));
  } catch (error) {
    return next(error);
  }
});

resourcesRouter.post('/vehicles', async (request, response, next) => {
  try {
    return response.status(201).json(await createVehicle(request.auth!.tenantId, request.body));
  } catch (error) {
    return next(error);
  }
});

resourcesRouter.get('/service-orders', async (request, response, next) => {
  try {
    return response.json(await listServiceOrders(request.auth!.tenantId));
  } catch (error) {
    return next(error);
  }
});

resourcesRouter.post('/service-orders', async (request, response, next) => {
  try {
    return response.status(201).json(await createServiceOrder(request.auth!.tenantId, request.body));
  } catch (error) {
    return next(error);
  }
});

resourcesRouter.get('/contracts', async (request, response, next) => {
  try {
    return response.json(await listContracts(request.auth!.tenantId));
  } catch (error) {
    return next(error);
  }
});

resourcesRouter.post('/contracts', async (request, response, next) => {
  try {
    return response.status(201).json(await createContract(request.auth!.tenantId, request.body));
  } catch (error) {
    return next(error);
  }
});

resourcesRouter.get('/invoices', async (request, response, next) => {
  try {
    return response.json(await listInvoices(request.auth!.tenantId));
  } catch (error) {
    return next(error);
  }
});

resourcesRouter.get('/collection-agreements', async (request, response, next) => {
  try {
    return response.json(await listCollectionAgreements(request.auth!.tenantId));
  } catch (error) {
    return next(error);
  }
});

resourcesRouter.post('/collection-agreements', async (request, response, next) => {
  try {
    return response.status(201).json(await createCollectionAgreement(request.auth!.tenantId, request.auth!.userId, request.body));
  } catch (error) {
    return next(error);
  }
});

resourcesRouter.get('/command-queue', async (request, response, next) => {
  try {
    return response.json(await listCommandQueue(request.auth!.tenantId));
  } catch (error) {
    return next(error);
  }
});

resourcesRouter.post('/command-queue', async (request, response, next) => {
  try {
    return response.status(201).json(await enqueueCommand(request.auth!.tenantId, request.auth!.userId, request.body));
  } catch (error) {
    return next(error);
  }
});

resourcesRouter.get('/settings', async (request, response, next) => {
  try {
    return response.json(await getSettings(request.auth!.tenantId));
  } catch (error) {
    return next(error);
  }
});

resourcesRouter.put('/settings', async (request, response, next) => {
  try {
    return response.json(await updateSettings(request.auth!.tenantId, request.body));
  } catch (error) {
    return next(error);
  }
});
