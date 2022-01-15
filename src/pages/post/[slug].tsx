import { GetStaticPaths, GetStaticProps } from 'next';
import Head from 'next/head';
import { useRouter } from 'next/router'

import { getPrismicClient } from '../../services/prismic';
import Prismic from '@prismicio/client'

import commonStyles from '../../styles/common.module.scss';
import styles from './post.module.scss';

import { FiCalendar, FiUser, FiClock } from 'react-icons/fi'
import { RichText } from 'prismic-dom';
import { format } from 'date-fns';
import ptBR from 'date-fns/locale/pt-BR';

interface Post {
  first_publication_date: string | null;
  data: {
    title: string;
    banner: {
      url: string;
    };
    author: string;
    content: {
      heading: string;
      body: {
        text: string;
      }[];
    }[];
  };
}

interface PostProps {
  post: Post;
}

export default function Post({ post }: PostProps) {
  const router = useRouter()

  if (router.isFallback) {
    return <div>Carregando...</div>
  }

  function calculateEstimatedReadingTime(post: Post): number {
    const wordsPerMinute = 200;

    const totalWordsInHeading = RichText.asText(
      post.data.content.reduce((acc, { heading }) => [...acc, heading], [])
    ).split(' ').length;

    const totalWordsInBody = RichText.asText(
      post.data.content.reduce((acc, { body }) => [...acc, ...body], [])
    ).split(' ').length;

    return Math.ceil((totalWordsInHeading + totalWordsInBody) / wordsPerMinute);
  }

  return (
    <>
      <Head>
        <title>Post | spacetraveling</title>
      </Head>

      <main className={styles.postContainer}>
        <img src={post.data.banner.url} />
        <div className={styles.postContent}>
          <div className={styles.postTitleContainer}>
            <h1>{post.data.title}</h1>
          </div>
          <div className={styles.postInfoContainer}>
            <div className={styles.postInfo}>
              <FiCalendar/>
              <time>{
                format(
                  new Date(
                    post.first_publication_date,
                  ),
                  'PP',
                  {
                    locale: ptBR,
                  }
                )}
              </time>
            </div>
            <div className={styles.postInfo}>
              <FiUser/>
              <span>{post.data.author}</span>
            </div>
            <div className={styles.postInfo}>
              <FiClock/>
              <span>{`${calculateEstimatedReadingTime(post)} min`}</span>
            </div>
          </div>
          <div className={styles.postSectionContainer}>
            {post.data.content.map(content => (
              <div className={styles.postSection} key={content.heading}>
                <h2>{content.heading}</h2>
                <div
                  dangerouslySetInnerHTML={{ __html: RichText.asHtml(content.body)}}
                />
              </div>
            ))}
          </div>
        </div>
      </main>
    </>
  )
}

export const getStaticPaths = async () => {
  const prismic = getPrismicClient();
  const posts = await prismic.query([
    Prismic.predicates.at('document.type', 'post')
  ])

  const paths = posts.results.map(post => ({
    params: {
      slug: post.uid,
    }
  }))

  return {
    paths,
    fallback: true,
  };
};

export const getStaticProps = async ({ params }) => {
  const { slug } = params;

  const prismic = getPrismicClient();

  const response = await prismic.getByUID('post', String(slug), {});

  const post: Post = response;

  return {
    props: {
      post
    },
    redirect: 60 * 30 // 30 minutes
  }

};