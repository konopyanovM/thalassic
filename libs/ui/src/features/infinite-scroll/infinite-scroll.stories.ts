import { signal } from '@angular/core';
import { argsToTemplate, Meta, StoryObj } from '@storybook/angular';
import { InfiniteScroll as InfiniteScrollComponent } from './infinite-scroll';
import { DEFAULT_INFINITE_SCROLL_CONFIG } from './infinite-scroll.config';

interface MockArticle {
  id: number;
  title: string;
  excerpt: string;
}

const PAGE_SIZE = 15;
const TOTAL = 60;
const REQUEST_DURATION = 900;

const createArticles = (from: number, count: number): MockArticle[] =>
  Array.from({ length: count }, (_, offset) => ({
    id: from + offset,
    title: `Article ${from + offset + 1}`,
    excerpt: 'A short summary of what the article covers.',
  }));

/** Paged collection standing in for whatever the consumer loads. */
const createCollection = () => {
  const articles = signal<MockArticle[]>(createArticles(0, PAGE_SIZE));
  const loading = signal(false);
  const complete = signal(false);

  const loadNextPage = (): void => {
    loading.set(true);

    setTimeout(() => {
      const loaded = articles().length;
      const page = createArticles(loaded, Math.min(PAGE_SIZE, TOTAL - loaded));

      articles.update(current => [...current, ...page]);
      complete.set(articles().length >= TOTAL);
      loading.set(false);
    }, REQUEST_DURATION);
  };

  return { articles, loading, complete, loadNextPage };
};

const CONTAINER_STYLE = [
  'height: 400px',
  'overflow: auto',
  'border: 1px solid var(--color-outline-variant)',
  'border-radius: var(--radius-md)',
].join('; ');

const ARTICLE_STYLE = [
  'padding: var(--spacing-4)',
  'border-block-end: 1px solid var(--color-outline-variant)',
].join('; ');

const meta: Meta<InfiniteScrollComponent> = {
  component: InfiniteScrollComponent,
  title: 'Infinite scroll',
  args: {
    rootMargin: DEFAULT_INFINITE_SCROLL_CONFIG.rootMargin,
    autoLoadLimit: DEFAULT_INFINITE_SCROLL_CONFIG.autoLoadLimit,
    manual: false,
    disabled: false,
  },
  argTypes: {
    rootMargin: { control: { type: 'number' } },
    autoLoadLimit: { control: { type: 'number' } },
    manual: { control: { type: 'boolean' } },
    disabled: { control: { type: 'boolean' } },
  },
  render: args => ({
    props: { ...args, ...createCollection() },
    template: `
      <div #container style="${CONTAINER_STYLE}">
        @for (article of articles(); track article.id) {
          <div style="${ARTICLE_STYLE}">
            <strong>{{ article.title }}</strong>
            <p style="margin: 0; color: var(--color-on-surface-variant)">{{ article.excerpt }}</p>
          </div>
        }

        <!-- The list scrolls inside the panel, so the panel is the root the margin expands. -->
        <tls-infinite-scroll
          [root]="container"
          [loading]="loading()"
          [complete]="complete()"
          (loadMore)="loadNextPage()"
          ${argsToTemplate(args)}
        />
      </div>
    `,
  }),
};
export default meta;

type Story = StoryObj<InfiniteScrollComponent>;

export const InfiniteScroll: Story = {};

/** Every page waits on the button, whatever the scroll position. */
export const Manual: Story = {
  args: { manual: true },
};
