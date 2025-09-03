// @ts-ignore
import { Link } from 'react-router'
import GeneralList from "../../../components/GeneralList";
import { useBlogs } from '../../../API/Blog/blog.hook';
import { Button } from '@mui/material';
import { Add } from '@mui/icons-material';
import { Blog } from '../../../API/Blog/types';

const SERVER_FILE = process.env.REACT_APP_SERVER_FILE

const BlogList = () => {
  const renderBlogItem = (blog: Blog) => (
    <div dir='rtl' key={blog.id} className="p-3 border-b hover:bg-gray-50">
      <Link to={`/blog/${blog.id}`} className="font-medium hover:opacity-80">
        {/* Mobile Layout (column) */}
        <div className="md:hidden space-y-3">
          {/* Row 1: Title + ID */}
          <div className="flex flex-col">
            <p className="font-medium mb-2">{blog.title}</p>
            <p className="text-xs text-gray-500">ID: {blog.id}</p>
          </div>

          {/* Row 2: Subtitle */}
          {blog.sub_title && (
            <div>
              <p className="text-xs text-gray-400">زیرعنوان</p>
              <p className="text-sm text-gray-700">{blog.sub_title}</p>
            </div>
          )}

          {/* Row 3: Author */}
          <div>
            <p className="text-xs text-gray-400">نویسنده</p>
            <p className="text-sm text-gray-700">
              {blog.author?.first_name} {blog.author?.last_name || 'بدون نام'}
            </p>
          </div>

          {/* Row 4: Reading Time + Actions */}
          <div className="flex justify-between items-center">
            <span className="px-2 py-1 text-xs rounded-full bg-blue-100 text-blue-800">
              {blog.readingTime} دقیقه مطالعه
            </span>
            <div className="flex space-x-2">
              <Link
                to={`/blog/${blog.id}/edit`}
                className="px-2 py-1 text-sm text-blue-600 hover:bg-blue-50 rounded"
              >
                ویرایش
              </Link>
            </div>
          </div>
        </div>

        {/* Desktop Layout (grid) */}
        <div className="hidden md:grid grid-cols-12 items-center py-4">
          <div className="col-span-3">
            <div className='flex gap-3'>
              {/* Thumbnail */}
              <div className='w-16 h-16 rounded-md bg-gray-200 overflow-hidden'>
                {blog?.thumbnail?.file_name ? (
                  <img 
                    src={`${SERVER_FILE}/${blog?.thumbnail?.file_name}`} 
                    alt={blog.title} 
                    className='w-full h-full object-cover' 
                  />
                ) : (
                  <div className='w-full h-full flex items-center justify-center'>
                    <p className='text-sm text-center text-gray-500'>بدون تصویر</p>
                  </div>
                )}
              </div>

              <div>
                <p className="font-medium">{blog.title}</p>
                {blog.sub_title && (
                  <p className="text-xs text-gray-500">{blog.sub_title}</p>
                )}
              </div>
            </div>
          </div>

          <div className="col-span-2">
            <p className="text-sm">
              <span className="text-xs text-gray-400 block">نویسنده</span>
              {blog.author?.first_name} {blog.author?.last_name || 'بدون نام'}
            </p>
          </div>

          <div className="col-span-2">
            <p className="text-sm">
              <span className="text-xs text-gray-400 block">زمان مطالعه</span>
              {blog.readingTime} دقیقه
            </p>
          </div>

          <div className="col-span-3">
            <div className="flex flex-wrap gap-1">
              {blog.tags.map((tag, index) => (
                <span 
                  key={index} 
                  className="px-2 py-1 text-xs rounded-full bg-gray-100 text-gray-800"
                >
                  {tag}
                </span>
              ))}
            </div>
          </div>

          <div className="col-span-2 flex justify-end space-x-2">
            <Link
              to={`/blog/${blog.id}/edit`}
              className="px-2 py-1 text-sm text-blue-600 hover:bg-blue-50 rounded"
            >
              ویرایش
            </Link>
          </div>
        </div>
      </Link>
    </div>
  );

  const blogFilters = [
    {
      type: 'search',
      queryParamKey: 'author',
      label: 'نویسنده'
    },
    {
      type: 'search',
      queryParamKey: '_id',
      label: 'شناسه'
    },
    {
      type: 'search',
      queryParamKey: 'tags',
      label: 'برچسب‌ها'
    }
  ];

  return (
    <div className='w-full flex flex-col'>
      <div className='flex justify-start items-center mb-8'>
        <Button href="/blog/create" variant="contained" color="primary">
          <Add className='mr-2' />
          افزودن بلاگ جدید
        </Button>
      </div>

      <GeneralList
        useDataQuery={useBlogs}
        filters={blogFilters}
        renderItem={renderBlogItem}
        title="مدیریت بلاگ‌ها"
        searchPlaceholder="جستجو بر اساس عنوان"
        showDateFilter
      />
    </div>
  );
};

export default BlogList;