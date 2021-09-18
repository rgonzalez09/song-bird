const {
    Schema,
    model
} = require("mongoose");

const commentsSchema = new Schema({
    name: {
        type: String
    },
    comment: {
        type: String
    },
    imageUrl: {
        type: String
    },
    owner: {
        type: Schema.Types.ObjectId,
        ref: "User"
    },
    reviews: [{
        type: Schema.Types.ObjectId,
        ref: "Review"
    }],
});

const Comments = model("Comments", commentsSchema);

module.exports = Comments;