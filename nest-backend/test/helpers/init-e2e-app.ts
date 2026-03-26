import { INestApplication } from '@nestjs/common';

export async function initE2eApp(app: INestApplication): Promise<void> {
  await app.init();
  await app.listen(0, '127.0.0.1');
}
