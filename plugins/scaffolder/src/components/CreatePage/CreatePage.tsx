import React, { useState } from 'react';
import useStaleWhileRevalidate from 'swr';
import { useParams } from 'react-router-dom';
import { LinearProgress, Button } from '@material-ui/core';
import { catalogApiRef } from '@backstage/plugin-catalog';
import {
  useApi,
  SimpleStepper,
  SimpleStepperStep,
  Page,
  Content,
  ContentHeader,
  Header,
  Lifecycle,
} from '@backstage/core';
import { TemplateEntityV1alpha1 } from '@backstage/catalog-model';
import { withTheme, IChangeEvent } from '@rjsf/core';
import { Theme as MuiTheme } from '@rjsf/material-ui';
import { JobStatusModal } from '../JobStatusModal';
import { scaffolderApiRef } from '../../api';

const Form = withTheme(MuiTheme);

export const CreatePage = () => {
  const catalogApi = useApi(catalogApiRef);
  const scaffolderApi = useApi(scaffolderApiRef);
  const { templateName } = useParams();
  const {
    data: [template] = [] as TemplateEntityV1alpha1[],
    isValidating,
  } = useStaleWhileRevalidate(
    `templates/${templateName}`,
    async () =>
      (catalogApi.getEntities({
        kind: 'Template',
        'metadata.name': templateName,
      }) as any) as Promise<TemplateEntityV1alpha1[]>,
  );
  const [formState, setFormState] = useState({});

  const handleChange = (e: IChangeEvent) =>
    setFormState({ ...formState, ...e.formData });

  const [jobId, setJobId] = useState<string | null>(null);
  const handleClose = () => setJobId(null);
  if (!template && isValidating) return <LinearProgress />;
  if (!template || !template?.spec?.parameters) return null;

  const handleCreate = async () => {
    const job = await scaffolderApi.scaffold(template, formState);
    setJobId(job);
  };

  return (
    <Page>
      <Header
        pageTitleOverride="Create a new component"
        title={
          <>
            Create a new component <Lifecycle alpha shorthand />
          </>
        }
        subtitle="Create new software components using standard templates"
      />
      <Content>
        <ContentHeader
          title={template.metadata.title as string}
        ></ContentHeader>
        {jobId && <JobStatusModal jobId={jobId} onClose={handleClose} />}
        <SimpleStepper
          onStepChange={(_prevStep, nextStep) => {
            if (nextStep === 2) {
              handleCreate();
            }
          }}
        >
          <SimpleStepperStep title="Configure your component">
            <Form
              formData={formState}
              onChange={handleChange}
              schema={{
                $schema: 'http://json-schema.org/draft-07/schema#',
                properties: template?.spec?.parameters,
              }}
            >
              <Button hidden />
            </Form>
          </SimpleStepperStep>
          <SimpleStepperStep title="Choose repository">
            <Form
              formData={formState}
              onChange={handleChange}
              schema={{
                $schema: 'http://json-schema.org/draft-07/schema#',
                properties: {
                  repo: {
                    type: 'string',
                    description:
                      'Path to the repo where to upload created component',
                  },
                },
              }}
            >
              <Button hidden />
            </Form>
          </SimpleStepperStep>
        </SimpleStepper>
      </Content>
    </Page>
  );
};
