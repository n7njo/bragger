import { useForm, Controller } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { achievementSchema, AchievementFormData } from '../../schemas/achievementSchema'
import { CreateAchievementDto, UpdateAchievementDto, Achievement } from '../../types'
import { useCategories } from '../../hooks'
import { Input } from '../ui/Input'
import { TextArea } from '../ui/TextArea'
import { Select } from '../ui/Select'
import { TagInput } from '../ui/TagInput'
import { Button } from '../ui/Button'

interface AchievementFormProps {
  initialData?: Achievement
  isLoading?: boolean
  onSubmit: (data: CreateAchievementDto | UpdateAchievementDto) => void
  onCancel?: () => void
  submitLabel?: string
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

  const {
    register,
    handleSubmit,
    control,
    watch,
    formState: { errors, isSubmitting }
  } = useForm<AchievementFormData>({
    resolver: zodResolver(achievementSchema),
    defaultValues: {
      title: initialData?.title || '',
      description: initialData?.description || '',
      startDate: initialData?.startDate || '',
      endDate: initialData?.endDate || '',
      durationHours: initialData?.durationHours || undefined,
      categoryId: initialData?.categoryId || '',
      impact: initialData?.impact || '',
      skillsUsed: initialData?.skillsUsed || [],
      teamSize: initialData?.teamSize || undefined,
      priority: initialData?.priority || 'medium',
      tags: initialData?.tags?.map(tag => tag.name) || []
    }
  })

  const watchedStartDate = watch('startDate')

  const handleFormSubmit = (data: AchievementFormData) => {
    const formattedData = {
      ...data,
      skillsUsed: data.skillsUsed.filter(skill => skill.trim() !== ''),
      tags: data.tags.filter(tag => tag.trim() !== '')
    }
    onSubmit(formattedData)
  }

  const categoryOptions = categories.map(category => ({
    value: category.id,
    label: category.name
  }))

  const priorityOptions = [
    { value: 'low', label: 'Low' },
    { value: 'medium', label: 'Medium' },
    { value: 'high', label: 'High' }
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

        <Select
          label="Category"
          {...register('categoryId')}
          options={categoryOptions}
          error={errors.categoryId?.message}
          required
          disabled={isSubmitting || isLoading || categoriesLoading}
          placeholder={categoriesLoading ? 'Loading categories...' : 'Select a category'}
        />

        <Input
          label="Team Size"
          type="number"
          {...register('teamSize', { valueAsNumber: true })}
          error={errors.teamSize?.message}
          disabled={isSubmitting || isLoading}
          placeholder="1"
          min="1"
        />

        <Select
          label="Priority"
          {...register('priority')}
          options={priorityOptions}
          error={errors.priority?.message}
          required
          disabled={isSubmitting || isLoading}
        />

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