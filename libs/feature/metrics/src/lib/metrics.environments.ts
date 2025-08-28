import { BooleanTransformer, EnvModel, EnvModelProperty } from '@nestjs-mod/common';

@EnvModel()
export class MetricsStaticEnvironments {
  @EnvModelProperty({
    description: 'Use guards',
    transform: new BooleanTransformer(),
    default: true,
    hidden: true,
  })
  useGuards?: boolean;

  @EnvModelProperty({
    description: 'Use filters',
    transform: new BooleanTransformer(),
    default: true,
    hidden: true,
  })
  useFilters?: boolean;

  @EnvModelProperty({
    description: 'Auto create user from guard',
    transform: new BooleanTransformer(),
    default: true,
    hidden: true,
  })
  autoCreateUser?: boolean;

  @EnvModelProperty({
    description: 'Skip any guard errors',
    transform: new BooleanTransformer(),
    default: false,
    hidden: true,
  })
  skipGuardErrors?: boolean;

  // cache settings
  @EnvModelProperty({
    description: 'TTL for cached data',
    default: 15_000,
    hidden: true,
  })
  cacheTTL?: number;

  // GitHub settings
  @EnvModelProperty({
    description: 'GitHub personal access token for API integration',
    hidden: true,
  })
  githubToken?: string;
}
