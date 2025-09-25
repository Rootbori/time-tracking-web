import { type Resolver } from "react-hook-form";
import { type ZodTypeAny, ZodError, type z } from "zod";

export function zodResolver<T extends ZodTypeAny>(schema: T): Resolver<z.infer<T>> {
  return async (values) => {
    try {
      const data = await schema.parseAsync(values);
      return {
        values: data,
        errors: {}
      };
    } catch (error) {
      if (error instanceof ZodError) {
        return {
          values: {},
          errors: error.errors.reduce((acc, current) => {
            if (current.path.length === 0) return acc;
            const field = current.path[0];
            acc[field as string] = {
              type: current.code,
              message: current.message
            } as any;
            return acc;
          }, {} as Record<string, any>)
        };
      }

      throw error;
    }
  };
}
