import { useForm, Controller } from 'react-hook-form'
import { useState, useEffect } from 'react'
import { zodResolver } from '@hookform/resolvers/zod'
import { achievementSchema, AchievementFormData } from '../../schemas/achievementSchema'
import { Achievement } from '../../types'
import { useCategories } from '../../hooks'
import { Input } from '../ui/Input'
import { TextArea } from '../ui/TextArea'
import { Select } from '../ui/Select'
import { TagInput } from '../ui/TagInput'
import { Button } from '../ui/Button'
import { ImageUpload } from '../ui/ImageUpload'

interface AchievementFormProps {
  initialData?: Achievement
  isLoading?: boolean
  onSubmit: (data: AchievementFormData, images?: ImageFile[]) => void
  onCancel?: () => void
  submitLabel?: string
}

interface ImageFile {
  file: File
  preview: string
  id: string
}

export function AchievementForm({
  initialData,
  isLoading = false,
  onSubmit,
  onCancel,
  submitLabel = 'Save Achievement'
}: AchievementFormProps) {
  const { data: categoriesResponse, isLoading: categoriesLoading } = useCategories()
  const categories = categoriesResponse?.data || []
  const [images, setImages] = useState<ImageFile[]>([])

  const {
    register,
    handleSubmit,
    control,
    watch,
    reset,
    formState: { errors, isSubmitting }
  } = useForm<AchievementFormData>({
    resolver: zodResolver(achievementSchema),
    defaultValues: {
      title: initialData?.title || '',
      description: initialData?.description || '',
      startDate: initialData?.startDate ? new Date(initialData.startDate).toISOString().split('T')[0] : '',
      endDate: initialData?.endDate ? new Date(initialData.endDate).toISOString().split('T')[0] : '',
      durationHours: initialData?.durationHours || undefined,
      categoryId: initialData?.categoryId || '',
      impact: initialData?.impact || '',
      skillsUsed: initialData?.skillsUsed || [],
      status: initialData?.status || 'idea',
      githubUrl: initialData?.githubUrl || '',
      tags: initialData?.tags?.map(tag => tag.name) || []
    }
  })

  // Reset form when initialData changes
  useEffect(() => {
    if (initialData) {
      reset({
        title: initialData.title || '',
        description: initialData.description || '',
        startDate: initialData.startDate ? new Date(initialData.startDate).toISOString().split('T')[0] : '',
        endDate: initialData.endDate ? new Date(initialData.endDate).toISOString().split('T')[0] : '',
        durationHours: initialData.durationHours || undefined,
        categoryId: initialData.categoryId || '',
        impact: initialData.impact || '',
        skillsUsed: initialData.skillsUsed || [],
        status: initialData.status || 'idea',
        githubUrl: initialData.githubUrl || '',
        tags: initialData.tags?.map(tag => tag.name) || []
      })
      // Clear images when editing a different achievement
      setImages([])
    }
  }, [initialData, reset])

  const watchedStartDate = watch('startDate')

  const handleFormSubmit = (data: AchievementFormData) => {
    console.log('Form submitted with data:', data)
    console.log('Form has', images.length, 'images')

    const formattedData = {
      ...data,
      startDate: new Date(data.startDate).toISOString(),
      endDate: data.endDate ? new Date(data.endDate).toISOString() : undefined,
      skillsUsed: data.skillsUsed.filter(skill => skill.trim() !== ''),
      tags: data.tags.filter(tag => tag.trim() !== '')
    }

    console.log('Calling onSubmit with formatted data:', formattedData)
    onSubmit(formattedData, images.length > 0 ? images : undefined)
  }

  const categoryOptions = categories.map(category => ({
    value: category.id,
    label: category.name
  }))

  const statusOptions = [
    { value: 'idea', label: 'Idea' },
    { value: 'concept', label: 'Concept' },
    { value: 'usable', label: 'Usable' },
    { value: 'complete', label: 'Complete' }
  ]

  return (
    <form onSubmit={handleSubmit(handleFormSubmit)} className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="md:col-span-2">
          <Input
            label="Title"
            {...register('title')}
            error={errors.title?.message}
            required
            disabled={isSubmitting || isLoading}
            placeholder="Enter achievement title..."
          />
        </div>

        <div className="md:col-span-2">
          <TextArea
            label="Description"
            {...register('description')}
            error={errors.description?.message}
            required
            disabled={isSubmitting || isLoading}
            placeholder="Describe your achievement in detail..."
            rows={4}
          />
        </div>

        <Input
          label="Start Date"
          type="date"
          {...register('startDate')}
          error={errors.startDate?.message}
          required
          disabled={isSubmitting || isLoading}
        />

        <Input
          label="End Date"
          type="date"
          {...register('endDate')}
          error={errors.endDate?.message}
          disabled={isSubmitting || isLoading}
          min={watchedStartDate}
          helperText="Optional - leave empty for ongoing achievements"
        />

        <Input
          label="Duration (Hours)"
          type="number"
          {...register('durationHours', { valueAsNumber: true })}
          error={errors.durationHours?.message}
          disabled={isSubmitting || isLoading}
          placeholder="0"
          min="0"
          step="0.5"
        />

        <Controller
          name="categoryId"
          control={control}
          render={({ field }) => (
            <Select
              label="Category"
              value={field.value}
              onChange={field.onChange}
              options={categoryOptions}
              error={errors.categoryId?.message}
              required
              disabled={isSubmitting || isLoading || categoriesLoading}
              placeholder={categoriesLoading ? 'Loading categories...' : 'Select a category'}
            />
          )}
        />



        <Controller
          name="status"
          control={control}
          render={({ field }) => (
            <Select
              label="Status"
              value={field.value}
              onChange={field.onChange}
              options={statusOptions}
              error={errors.status?.message}
              required
              disabled={isSubmitting || isLoading}
            />
          )}
        />

        <div className="md:col-span-2">
          <Input
            label="GitHub URL"
            {...register('githubUrl')}
            error={errors.githubUrl?.message}
            disabled={isSubmitting || isLoading}
            placeholder="https://github.com/username/repository"
            helperText="Link to the GitHub project (optional)"
          />
        </div>

        <div className="md:col-span-2">
          <TextArea
            label="Impact"
            {...register('impact')}
            error={errors.impact?.message}
            disabled={isSubmitting || isLoading}
            placeholder="Describe the impact and results of your achievement..."
            rows={3}
          />
        </div>

        <div className="md:col-span-2">
          <Controller
            name="skillsUsed"
            control={control}
            render={({ field }) => (
              <TagInput
                label="Skills Used"
                value={field.value}
                onChange={field.onChange}
                error={errors.skillsUsed?.message}
                disabled={isSubmitting || isLoading}
                placeholder="Type skills and press Enter (e.g., React, TypeScript, Node.js)..."
                maxTags={20}
              />
            )}
          />
        </div>

        <div className="md:col-span-2">
          <Controller
            name="tags"
            control={control}
            render={({ field }) => (
              <TagInput
                label="Tags"
                value={field.value}
                onChange={field.onChange}
                error={errors.tags?.message}
                disabled={isSubmitting || isLoading}
                placeholder="Add tags to categorize your achievement..."
                maxTags={10}
              />
            )}
          />
        </div>

        <div className="md:col-span-2">
          <ImageUpload
            value={images}
            onChange={setImages}
            disabled={isSubmitting || isLoading}
            label="Screenshots & Images"
            helperText="Upload screenshots, diagrams, or photos to showcase your achievement"
            maxImages={8}
            maxSize={5}
          />
        </div>
      </div>

      <div className="flex items-center justify-end space-x-4 pt-6 border-t">
        {onCancel && (
          <Button
            type="button"
            variant="outline"
            onClick={onCancel}
            disabled={isSubmitting || isLoading}
          >
            Cancel
          </Button>
        )}
        
        <Button
          type="submit"
          disabled={isSubmitting || isLoading}
          loading={isSubmitting || isLoading}
        >
          {submitLabel}
        </Button>
      </div>
    </form>
  )
}