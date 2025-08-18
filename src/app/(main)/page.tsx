import Link from 'next/link';
import {getAllBlogs} from "@blog/server/blog";

export default async function Home() {
  const pages = await getAllBlogs();
  
  return (
    <div>
      <div className='hero min-h-[calc(50vh)] my-4'>
        <div className='hero-content text-center'>
          <div className='max-w-md'>
            <h1 className='text-5xl font-bold'>Hello there</h1>
            <p className='py-6'>
              Provident cupiditate voluptatem et in. Quaerat fugiat ut assumenda
              excepturi exercitationem quasi. In deleniti eaque aut repudiandae et
              a id nisi.
            </p>
            <Link href='/courses' className='btn btn-primary'>
              Get Started
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
