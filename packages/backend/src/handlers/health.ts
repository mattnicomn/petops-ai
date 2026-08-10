import type { APIGatewayProxyEventV2, APIGatewayProxyResultV2 } from 'aws-lambda';
import { randomUUID } from 'crypto';

export const handler = async (
  event: APIGatewayProxyEventV2
): Promise<APIGatewayProxyResultV2> => {
  const correlationId = event.headers?.['x-correlation-id'] || randomUUID();

  return {
    statusCode: 200,
    headers: {
      'Content-Type': 'application/json',
      'X-Correlation-Id': correlationId,
    },
    body: JSON.stringify({
      status: 'ok',
      service: 'petops-ai',
      environment: 'hackathon',
      correlationId,
      timestamp: new Date().toISOString(),
    }),
  };
};
