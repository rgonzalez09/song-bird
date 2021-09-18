const {
    Schema,
    model
} = require("mongoose");

const commentsSchema = new Schema({
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
    commentAbout: {
        type: Schema.Types.ObjectId, 
        ref: "User"
    }
});

const Comments = model("Comments", commentsSchema);

module.exports = Comments;