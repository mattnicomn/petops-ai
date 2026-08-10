import type { APIGatewayProxyEventV2, APIGatewayProxyResultV2 } from 'aws-lambda';
import { DynamoDBClient } from '@aws-sdk/client-dynamodb';
import { DynamoDBDocumentClient, PutCommand, GetCommand, QueryCommand } from '@aws-sdk/lib-dynamodb';
import { randomUUID } from 'crypto';
import { CreateCarePlanRequestSchema } from '@petops-ai/shared';

const ddbClient = new DynamoDBClient({ region: 'us-east-1' });
const docClient = DynamoDBDocumentClient.from(ddbClient);
const TABLE_NAME = process.env.TABLE_NAME || 'petops-ai-care-plans';

export const handler = async (event: APIGatewayProxyEventV2): Promise<APIGatewayProxyResultV2> => {
  const correlationId = event.headers?.['x-correlation-id'] || randomUUID();
  const method = event.requestContext.http.method;
  const path = event.rawPath;

  try {
    if (method === 'POST' && path === '/api/care-plans') {
      return await createCarePlan(event, correlationId);
    } else if (method === 'GET' && path === '/api/care-plans') {
      return await listCarePlans(correlationId);
    } else if (method === 'GET' && path.startsWith('/api/care-plans/')) {
      const id = path.split('/api/care-plans/')[1];
      return await getCarePlan(id, correlationId);
    }

    return errorResponse(404, 'Not found', correlationId);
  } catch (err: unknown) {
    const error = err as Error;
    console.error(JSON.stringify({ correlationId, event: 'crud_error', error: error.message }));
    if (error.name === 'ResourceNotFoundException' || error.name === 'ServiceUnavailableException') {
      return errorResponse(503, 'Storage service is temporarily unavailable', correlationId);
    }
    return errorResponse(500, 'An unexpected error occurred', correlationId);
  }
};

async function createCarePlan(event: APIGatewayProxyEventV2, correlationId: string): Promise<APIGatewayProxyResultV2> {
  const body = JSON.parse(event.body || '{}');
  const parsed = CreateCarePlanRequestSchema.safeParse(body);
  if (!parsed.success) {
    return errorResponse(400, 'Invalid request', correlationId, parsed.error.issues);
  }

  const data = parsed.data;
  const id = randomUUID();
  const now = new Date().toISOString();

  const item = {
    id,
    status: data.status,
    createdAt: now,
    updatedAt: now,
    decisionAt: now,
    originalRequest: data.originalRequest,
    extractionResult: data.extractionResult,
    attentionFlags: data.attentionFlags,
    carePlan: data.carePlan,
    correlationId: data.correlationId,
    petName: data.carePlan.sections.petInformation.name || 'Unknown',
    serviceType: data.carePlan.sections.services[0]?.type || 'unknown',
  };

  await docClient.send(new PutCommand({ TableName: TABLE_NAME, Item: item }));

  console.log(JSON.stringify({ correlationId, event: 'care_plan_created', id }));

  return {
    statusCode: 201,
    headers: { 'Content-Type': 'application/json', 'X-Correlation-Id': correlationId },
    body: JSON.stringify({ id, status: 'approved', createdAt: now, correlationId }),
  };
}

async function listCarePlans(correlationId: string): Promise<APIGatewayProxyResultV2> {
  const result = await docClient.send(new QueryCommand({
    TableName: TABLE_NAME,
    IndexName: 'createdAt-index',
    KeyConditionExpression: '#status = :status',
    ExpressionAttributeNames: { '#status': 'status' },
    ExpressionAttributeValues: { ':status': 'approved' },
    ScanIndexForward: false,
    Limit: 20,
    ProjectionExpression: 'id, petName, serviceType, #status, createdAt',
  }));

  return {
    statusCode: 200,
    headers: { 'Content-Type': 'application/json', 'X-Correlation-Id': correlationId },
    body: JSON.stringify({ items: result.Items || [], correlationId }),
  };
}

async function getCarePlan(id: string, correlationId: string): Promise<APIGatewayProxyResultV2> {
  const result = await docClient.send(new GetCommand({ TableName: TABLE_NAME, Key: { id } }));

  if (!result.Item) {
    return errorResponse(404, 'Care plan not found', correlationId);
  }

  return {
    statusCode: 200,
    headers: { 'Content-Type': 'application/json', 'X-Correlation-Id': correlationId },
    body: JSON.stringify({ carePlan: result.Item, correlationId }),
  };
}

function errorResponse(status: number, message: string, correlationId: string, details?: unknown): APIGatewayProxyResultV2 {
  return {
    statusCode: status,
    headers: { 'Content-Type': 'application/json', 'X-Correlation-Id': correlationId },
    body: JSON.stringify({ error: message, correlationId, ...(details ? { details } : {}) }),
  };
}
