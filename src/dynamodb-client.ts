import {
  DynamoDBClient,
  CreateTableCommand,
  DynamoDBClientConfig,
  PutItemCommand,
  QueryCommand,
  AttributeValue,
} from '@aws-sdk/client-dynamodb';
import { load } from 'ts-dotenv';

type Item = {
  userId: string;
  createdAt: string;
};

const env = load({
  AWS_REGION: String,
  DYNAMODB_ENDPOINT: String,
  DYNAMODB_TABLE_NAME: String,
  DYNAMODB_ACCESS_KEY_ID: String,
  DYNAMODB_SECRET_ACCESS_KEY: String,
});

const config: DynamoDBClientConfig = {
  region: env.AWS_REGION,
  endpoint: env.DYNAMODB_ENDPOINT,
  credentials: {
    accessKeyId: env.DYNAMODB_ACCESS_KEY_ID ?? 'dummy',
    secretAccessKey: env.DYNAMODB_SECRET_ACCESS_KEY ?? 'dummy',
  },
};

export default class DynamodbClient {
  private client: DynamoDBClient;

  constructor() {
    this.client = new DynamoDBClient(config);
  }

  public async createTable(): Promise<void> {
    const command = new CreateTableCommand({
      TableName: env.DYNAMODB_TABLE_NAME,
      KeySchema: [
        { AttributeName: 'userId', KeyType: 'HASH' },
        { AttributeName: 'itemId', KeyType: 'RANGE' },
      ],
      AttributeDefinitions: [
        { AttributeName: 'userId', AttributeType: 'S' },
        { AttributeName: 'itemId', AttributeType: 'S' },
      ],
      ProvisionedThroughput: {
        ReadCapacityUnits: 1,
        WriteCapacityUnits: 1,
      },
    });

    try {
      const data = await this.client.send(command);
      console.log('テーブルが作成されました:', data);
    } catch (err) {
      console.error('テーブル作成に失敗しました:', err);
    }
  }

  public async putItem(item: Item): Promise<void> {
    const command = new PutItemCommand({
      TableName: env.DYNAMODB_TABLE_NAME,
      Item: {
        userId: { S: item.userId },
        // itemId: { S: item.itemId },
        // salesDate: { S: item.salesDate },
        // itemName: { S: item.itemName },
        // itemPrice: { N: item.itemPrice.toString() },
        // salesFee: { N: item.salesFee.toString() },
        // profit: { N: item.profit.toString() },
        // shippingCost: { N: item.shippingCost.toString() },
        // shippingType: { S: item.shippingType },
        // createdAt: { S: item.createdAt },
      },
    });

    try {
      await this.client.send(command);
    } catch (err) {
      console.error('データ登録に失敗しました:', err);
    }
  }

  public async getItem(
    userId: string
  ): Promise<Record<string, AttributeValue>[] | undefined> {
    const command = new QueryCommand({
      TableName: env.DYNAMODB_TABLE_NAME,
      KeyConditionExpression: 'userId = :userId',
      ExpressionAttributeValues: {
        ':userId': { S: userId },
      },
    });
    try {
      const output = await this.client.send(command);
      return output.Items;
    } catch (err) {
      console.log('データの取得に失敗しました:', err);
    }
    return [];
  }
}
