import Head from 'next/head';
import Link from 'next/link';

import Prismic from '@prismicio/client'
import { getPrismicClient } from '../services/prismic';

import { format } from 'date-fns';
import ptBR from 'date-fns/locale/pt-BR';

import commonStyles from '../styles/common.module.scss';
import styles from './home.module.scss';

import { FiCalendar, FiUser } from 'react-icons/fi'
import { useState } from 'react';

interface Post {
  uid?: string;
  first_publication_date: string | null;
  data: {
    title: string;
    subtitle: string;
    author: string;
  };
}

interface PostPagination {
  next_page: string;
  results: Post[];
}

interface HomeProps {
  postsPagination: PostPagination;
  preview: boolean;
}

export default function Home({ postsPagination, preview }: HomeProps) {
  const [posts, setPosts] = useState<Post[]>(postsPagination.results)
  const [nextPage, setNextPage] = useState(postsPagination.next_page)

  async function handleLoadPosts() {
    fetch(nextPage)
    .then(response => response.json())
    .then(data => {
      const currentPosts = [...posts]
      const nextPosts = [
        ...data.results.map(post => ({
          uid: post.uid,
          first_publication_date: format(
            new Date(
              post.first_publication_date,
            ),
            'PP',
            {
              locale: ptBR,
            }
          ),
          data: {
            title: post.data.title,
            subtitle: post.data.subtitle,
            author: post.data.author
          }
        }))
      ]
      const updatedPosts = currentPosts.concat(nextPosts)
      setPosts(updatedPosts)
      setNextPage(data.next_page)
    })
  }

  return (
    <>
      <Head>
        <title>Home | spacetraveling</title>
      </Head>

      <main className={styles.container}>
        <div className={styles.posts}>
          {posts.map(post => (
            <Link href={`/post/${post.uid}`} key={post.uid}>
              <a>
                <strong>{post.data.title}</strong>
                <p>{post.data.subtitle}</p>
                <div>
                  <div className={styles.info}>
                    <FiCalendar/>
                    <time>
                      {format(
                        new Date(post.first_publication_date),
                          'dd MMM yyyy',
                          {
                            locale: ptBR,
                          }
                      )}
                    </time>
                  </div>
                  <div className={styles.info}>
                    <FiUser/>
                    <span>{post.data.author}</span>
                  </div>
                </div>
              </a>
            </Link>
          ))}
          {nextPage ? <button
            type="button"
            onClick={handleLoadPosts}
          >
            Carregar mais posts
          </button> : null}
        </div>

        {preview && (
          <aside className={commonStyles.exitPreviewButtonContainer}>
            <Link href="/api/exit-preview">
              <a className={commonStyles.exitPreviewButton}>Sair do modo Preview</a>
            </Link>
          </aside>
        )}

      </main>
    </>
  )
}

export const getStaticProps = async ({
  preview = false,
  previewData
}) => {
  const prismic = getPrismicClient();

  const postsResponse = await prismic.query([
    Prismic.predicates.at('document.type', 'post')
  ], {
    fetch: ['post.title', 'post.subtitle', 'post.author'],
    orderings: '[my.post.first_publication_date desc]',
    pageSize: 3,
    ref: previewData?.ref ?? null
  });

  const posts: Post[] = postsResponse.results.map(post => {
    return {
      uid: post.uid,
      first_publication_date: post.first_publication_date,
      data: {
        title: post.data.title,
        subtitle: post.data.subtitle,
        author: post.data.author
      }
    }
  })

  const postsPagination: PostPagination = {
    next_page: postsResponse.next_page,
    results: posts
  }  

  return {
    props: {
      postsPagination,
      preview
    },
    redirect: 60 * 60 * 24 // 24 hours
  }
};
