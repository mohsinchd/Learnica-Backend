import mongoose from "mongoose";

const courseSchema = new mongoose.Schema({
  title: {
    type: String,
    required: [true, "A course must have a title"],
    minLength: [4, "A title must be of 4 character long."],
    maxLength: [80, "A title cannot be longer then 80 characters"],
  },

  description: {
    type: String,
    required: [true, "A course must have a description"],
    minLength: [20, "Course description must be atleast 20 characters"],
  },

  poster: {
    public_id: {
      type: String,
      required: true,
    },
    url: {
      type: String,
      required: true,
    },
  },

  category: {
    type: String,
    required: [true, "Category is Required."],
  },

  courseFor: {
    type: String,
    required: [
      true,
      "Please tell the audience who is eligible to purchase this course.",
    ],
  },

  preReq: {
    type: String,
    required: [true, "Please enter the Pre requistes for this course."],
  },

  instructor: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true,
  },

  enrolledStudents: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
    },
  ],

  price: {
    type: Number,
    required: true,
  },

  numOfReviews: {
    type: Number,
    default: 0,
  },

  sections: [
    {
      title: {
        type: String,
        required: true,
      },
      lectures: [
        {
          title: {
            type: String,
            required: true,
          },
          video: {
            public_id: {
              type: String,
              required: true,
            },
            url: {
              type: String,
              required: true,
            },
          },
        },
      ],
    },
  ],

  reviews: [
    {
      user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        required: true,
      },

      rating: {
        type: Number,
        required: true,
      },
      comment: {
        type: String,
        required: true,
      },
    },
  ],

  averageRating: {
    type: Number,
    default: 0,
  },

  createdAt: {
    type: Date,
    default: Date.now,
  },
});

export const Course = mongoose.model("Course", courseSchema);
