import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import serverConfig from './config/server.config';
import databaseConfig from './config/database.config';
import tokenConfig from './config/token.config';
import { CoreModule } from './core/core.module';
import { UserModule } from './modules/user/user.module';
import { AuthModule } from './modules/auth/auth.module';
import { TypeOrmModule } from '@nestjs/typeorm';
import { DatabaseFactory } from './setup/database.factory';
import authkeyConfig from './config/authkey.config';
import { RoleModule } from './modules/role/role.module';
import { DepartmentModule } from './modules/department/department.module';
import { CategoryModule } from './modules/category/category.module';
import { SubCategoryModule } from './modules/sub-category/sub-category.module';
import { ProductGroupModule } from './modules/product-group/product-group.module';
import { ProductModule } from './modules/product/product.module';
import { ProductAttributeModule } from './modules/product-attribute/product-attribute.module';
import { ProductVariantModule } from './modules/product-variant/product-variant.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      load: [serverConfig, databaseConfig, tokenConfig, authkeyConfig],
      cache: true,
      envFilePath: getEnvFilePath(),
    }),
    TypeOrmModule.forRootAsync({
      imports: [ConfigModule],
      useClass: DatabaseFactory,
    }),
    CoreModule,
    UserModule,
    AuthModule,
    RoleModule,
    DepartmentModule,
    CategoryModule,
    SubCategoryModule,
    ProductGroupModule,
    ProductModule,
    ProductAttributeModule,
    ProductVariantModule,
  ],
})
export class AppModule {}

function getEnvFilePath() {
  return process.env.NODE_ENV === 'test' ? '.env.test' : '.env';
}
