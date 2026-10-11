package server

import (
	"context"
	"database/sql"
	"fmt"

	"connectrpc.com/connect"
	lighteventv1 "github.com/aarongodin/lightevent/internal/gen/lightevent/v1"
	"github.com/aarongodin/lightevent/internal/model"
	"github.com/aarongodin/lightevent/internal/storage"
)

func translateTag(rec storage.Tag) *lighteventv1.Tag {
	return &lighteventv1.Tag{Name: rec.Name, Label: rec.Label}
}

// setEventTags replaces the tags of an event. Every tag must exist.
func setEventTags(ctx context.Context, q *storage.Queries, eventID int64, names []string) error {
	if err := q.DeleteEventTags(ctx, eventID); err != nil {
		return err
	}
	for i, name := range names {
		tag, err := q.GetTagByName(ctx, name)
		if err != nil {
			if isNoRows(err) {
				return newError(connect.CodeInvalidArgument, fmt.Sprintf("event.tags[%d]: the tag %q does not exist", i, name))
			}
			return err
		}
		if err := q.AddEventTag(ctx, storage.AddEventTagParams{EventID: eventID, TagID: tag.ID}); err != nil {
			return err
		}
	}
	return nil
}

func (s *Server) listPublicTags(ctx context.Context) ([]*lighteventv1.Tag, error) {
	recs, err := s.q.ListPublicTags(ctx)
	if err != nil {
		return nil, err
	}
	tags := make([]*lighteventv1.Tag, 0, len(recs))
	for _, rec := range recs {
		tags = append(tags, translateTag(rec))
	}
	return tags, nil
}

func (s *Server) ListTags(ctx context.Context, _ *connect.Request[lighteventv1.ListTagsRequest]) (*connect.Response[lighteventv1.ListTagsResponse], error) {
	if !identity(ctx).IsAdmin() {
		tags, err := s.listPublicTags(ctx)
		if err != nil {
			return nil, errorResponse(ctx, err, "tags")
		}
		return connect.NewResponse(&lighteventv1.ListTagsResponse{Tags: tags}), nil
	}

	rows, err := s.q.ListTagsWithCounts(ctx)
	if err != nil {
		return nil, errorResponse(ctx, err, "tags")
	}
	tags := make([]*lighteventv1.Tag, 0, len(rows))
	for _, row := range rows {
		tag := translateTag(storage.Tag{Name: row.Name, Label: row.Label})
		tag.EventCount = int32(row.EventCount)
		tags = append(tags, tag)
	}
	return connect.NewResponse(&lighteventv1.ListTagsResponse{Tags: tags}), nil
}

func (s *Server) CreateTag(ctx context.Context, req *connect.Request[lighteventv1.CreateTagRequest]) (*connect.Response[lighteventv1.CreateTagResponse], error) {
	in := req.Msg.Tag
	if in == nil {
		return nil, newError(connect.CodeInvalidArgument, "tag: is required")
	}
	name, err := model.TagName("tag.name", in.Name)
	if err != nil {
		return nil, errorResponse(ctx, err, "tag")
	}
	label, err := model.TagLabel("tag.label", in.Label)
	if err != nil {
		return nil, errorResponse(ctx, err, "tag")
	}
	rec, err := s.q.CreateTag(ctx, storage.CreateTagParams{Name: name, Label: label, CreatedAt: s.Now()})
	if err != nil {
		return nil, errorResponse(ctx, err, "tag")
	}
	return connect.NewResponse(&lighteventv1.CreateTagResponse{Tag: translateTag(rec)}), nil
}

func (s *Server) UpdateTag(ctx context.Context, req *connect.Request[lighteventv1.UpdateTagRequest]) (*connect.Response[lighteventv1.UpdateTagResponse], error) {
	in := req.Msg.Tag
	if in == nil {
		return nil, newError(connect.CodeInvalidArgument, "tag: is required")
	}
	label, err := model.TagLabel("tag.label", in.Label)
	if err != nil {
		return nil, errorResponse(ctx, err, "tag")
	}
	rec, err := s.q.GetTagByName(ctx, in.Name)
	if err != nil {
		return nil, errorResponse(ctx, err, "tag")
	}
	rec, err = s.q.UpdateTagLabel(ctx, storage.UpdateTagLabelParams{ID: rec.ID, Label: label, UpdatedAt: sql.NullTime{Time: s.Now(), Valid: true}})
	if err != nil {
		return nil, errorResponse(ctx, err, "tag")
	}
	return connect.NewResponse(&lighteventv1.UpdateTagResponse{Tag: translateTag(rec)}), nil
}

func (s *Server) DeleteTag(ctx context.Context, req *connect.Request[lighteventv1.DeleteTagRequest]) (*connect.Response[lighteventv1.DeleteTagResponse], error) {
	rec, err := s.q.GetTagByName(ctx, req.Msg.Name)
	if err != nil {
		return nil, errorResponse(ctx, err, "tag")
	}
	// Assignments to events are removed by the foreign key cascade.
	if err := s.q.DeleteTag(ctx, rec.ID); err != nil {
		return nil, errorResponse(ctx, err, "tag")
	}
	return connect.NewResponse(&lighteventv1.DeleteTagResponse{}), nil
}
