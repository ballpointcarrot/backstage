/*
 * Copyright 2022 The Backstage Authors
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *     http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

import { Config } from '@backstage/config';
import { CompoundEntityRef } from '@backstage/catalog-model';

/**
 * Lower-case entity triplets by default, but allow override.
 *
 * @public
 */
export function toLowercaseEntityRefMaybe(
  entityRef: CompoundEntityRef,
  config: Config,
): CompoundEntityRef {
  if (config.getOptionalBoolean('techdocs.legacyUseCaseSensitiveTripletPaths'))
    return entityRef;

  entityRef.kind = entityRef.kind.toLocaleLowerCase();
  entityRef.name = entityRef.name.toLocaleLowerCase();
  entityRef.namespace = entityRef.namespace.toLocaleLowerCase();

  return entityRef;
}

/**
 * Retrieves the configured path for the preview feature from the configuration.
 * @return a string containing the value of the preview path, or undefined if not set.
 *
 * @public
 */
export function getPreviewPath(config: Config): String | undefined {
  return config.getOptionalString('techdocs.preview.basePath');
}
